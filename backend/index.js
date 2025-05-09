import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

export default app;

// Fetch available formats for a video URL using yt-dlp
import { exec } from 'child_process';

app.get('/api/formats', (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  exec(`yt-dlp -F --no-playlist --no-warnings "${url}"`, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
    console.log('yt-dlp output for', url, '\n', stdout);
    if (err) {
      return res.status(500).json({ error: 'yt-dlp error', details: stderr || err.message });
    }
    // Parse yt-dlp output
    const lines = stdout.split('\n');
    let formats = [];
    let headerFound = false;
    let headerIdxs = {};
    for (const line of lines) {
      if (line.match(/^ID\s+EXT\s+RESOLUTION/i) || line.match(/^format code/i)) {
        headerFound = true;
        // Find column positions (fallback for new yt-dlp output)
        headerIdxs = {
          code: line.search(/^(ID|format code)/),
          ext: line.indexOf('EXT') !== -1 ? line.indexOf('EXT') : line.indexOf('extension'),
          res: line.indexOf('RESOLUTION') !== -1 ? line.indexOf('RESOLUTION') : line.indexOf('resolution'),
          note: line.indexOf('MORE INFO') !== -1 ? line.indexOf('MORE INFO') : line.indexOf('note'),
        };
        continue;
      }
      if (headerFound && line.trim() && !line.match(/^(ID|format code)/i)) {
        // Try column parse
        try {
          const code = line.substr(headerIdxs.code, headerIdxs.ext - headerIdxs.code).trim();
          const ext = line.substr(headerIdxs.ext, headerIdxs.res - headerIdxs.ext).trim();
          const res = line.substr(headerIdxs.res, headerIdxs.note - headerIdxs.res).trim();
          const note = line.substr(headerIdxs.note).trim();
          let sizeMatch = note.match(/~?(\d+(\.\d+)?[KMG]iB)/);
          let size = sizeMatch ? sizeMatch[1] : '';
          if (code && res) {
            formats.push({ code, ext, resolution: res, size, note });
            continue;
          }
        } catch (e) {}
        // Fallback: regex parse for lines with code, ext, res, note
        const regex = /^(\S+)\s+(\S+)\s+([\dxp]+|audio only)\s+.*?\|.*?\|.*?\|.*?\|.*?\|?(.*)$/;
        const m = line.match(regex);
        if (m) {
          const [_, code, ext, resolution, note] = m;
          let sizeMatch = note.match(/~?(\d+(\.\d+)?[KMG]iB)/);
          let size = sizeMatch ? sizeMatch[1] : '';
          if (code && resolution) {
            formats.push({ code, ext, resolution, size, note });
          }
        }
      }
    }
    formats = formats.filter(f => f.code && f.resolution);
    if (!formats.length) {
      return res.status(200).json({ formats: [], error: 'No formats parsed', raw: stdout });
    }
    res.json({ formats });
  });
});
import path from 'path';
import fs from 'fs';

// Download video with yt-dlp and stream progress
app.post('/api/download', (req, res) => {
  const { url, format, folder, filename } = req.body;
  if (!url || !format || !filename) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  // Default to ~/downloads if folder is blank or missing
  let downloadDir = folder && folder.trim() ? folder.trim() : '~/downloads';
  if (downloadDir.startsWith('~')) {
    downloadDir = path.join(process.env.HOME || process.env.USERPROFILE, downloadDir.slice(1));
  }
  downloadDir = path.resolve(downloadDir);
  if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });
  const outputPath = path.join(downloadDir, filename + '.%(ext)s');

  // Spawn yt-dlp with progress
  const yt = exec(
    `yt-dlp -f ${format} -o "${outputPath}" --newline --no-playlist --no-warnings "${url}"`,
    { maxBuffer: 1024 * 1024 * 10 }
  );

  res.setHeader('Content-Type', 'application/jsonl');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');
  yt.stdout.on('data', (data) => {
    // Parse progress lines (look for [download] lines)
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      const match = line.match(/\[download\]\s+(\d+\.\d+)% of ([^ ]+) at ([^ ]+) ETA ([^ ]+)/);
      if (match) {
        const [_, percent, size, speed, eta] = match;
        res.write(JSON.stringify({ percent: parseFloat(percent), size, speed, eta }) + '\n');
        if (typeof res.flush === 'function') res.flush();
      }
    });
  });
  yt.stderr.on('data', (data) => {
    res.write(JSON.stringify({ error: data.toString() }) + '\n');
    if (typeof res.flush === 'function') res.flush();
  });
  yt.on('close', (code) => {
    res.write(JSON.stringify({ done: true, code }) + '\n');
    if (typeof res.flush === 'function') res.flush();
    res.end();
  });
});
app.post('/api/screenshots', (req, res) => res.json({ screenshots: [] }));
app.post('/api/convert', (req, res) => res.json({ status: 'converting' }));
app.post('/api/hls', (req, res) => res.json({ status: 'hls-generating' }));

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}
