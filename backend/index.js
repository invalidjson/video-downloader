import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
const PORT = 5000;

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
    if (err) {
      return res.status(500).json({ error: 'yt-dlp error', details: stderr || err.message });
    }
    // Parse yt-dlp output
    const lines = stdout.split('\n');
    let formats = [];
    let headerFound = false;
    let headerIdxs = {};
    for (const line of lines) {
      if (line.match(/^format code/)) {
        headerFound = true;
        // Find column positions
        headerIdxs = {
          code: line.indexOf('format code'),
          ext: line.indexOf('extension'),
          res: line.indexOf('resolution'),
          note: line.indexOf('note'),
          size: line.indexOf('filesize'),
        };
        continue;
      }
      if (headerFound && line.trim() && !line.startsWith('format code')) {
        // Parse columns by position
        const code = line.substr(headerIdxs.code, headerIdxs.ext - headerIdxs.code).trim();
        const ext = line.substr(headerIdxs.ext, headerIdxs.res - headerIdxs.ext).trim();
        const res = line.substr(headerIdxs.res, headerIdxs.note - headerIdxs.res).trim();
        const note = line.substr(headerIdxs.note).trim();
        // Attempt to extract file size from note if present
        let sizeMatch = note.match(/~?(\d+(\.\d+)?[KMG]iB)/);
        let size = sizeMatch ? sizeMatch[1] : '';
        formats.push({
          code,
          ext,
          resolution: res,
          size,
          note
        });
      }
    }
    // Only keep formats with a code and resolution
    formats = formats.filter(f => f.code && f.resolution);
    res.json({ formats });
  });
});
import path from 'path';
import fs from 'fs';

// Download video with yt-dlp and stream progress
app.post('/api/download', (req, res) => {
  const { url, format, folder, filename } = req.body;
  if (!url || !format || !folder || !filename) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  const downloadDir = path.resolve(folder);
  if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });
  const outputPath = path.join(downloadDir, filename + '.%(ext)s');

  // Spawn yt-dlp with progress
  const yt = exec(
    `yt-dlp -f ${format} -o "${outputPath}" --newline --no-playlist --no-warnings "${url}"`,
    { maxBuffer: 1024 * 1024 * 10 }
  );

  res.setHeader('Content-Type', 'application/jsonl');
  yt.stdout.on('data', (data) => {
    // Parse progress lines (look for [download] lines)
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      const match = line.match(/\[download\]\s+(\d+\.\d+)% of ([^ ]+) at ([^ ]+) ETA ([^ ]+)/);
      if (match) {
        const [_, percent, size, speed, eta] = match;
        res.write(JSON.stringify({ percent: parseFloat(percent), size, speed, eta }) + '\n');
      }
    });
  });
  yt.stderr.on('data', (data) => {
    res.write(JSON.stringify({ error: data.toString() }) + '\n');
  });
  yt.on('close', (code) => {
    res.write(JSON.stringify({ done: true, code }) + '\n');
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
