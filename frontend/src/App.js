import React, { useState } from 'react';
import VideoInput from './components/VideoInput';
import SettingsMenu from './components/SettingsMenu';
import DownloadModal from './components/DownloadModal';
import DownloadProgressBar from './components/DownloadProgressBar';
import { ThemeProvider } from 'styled-components';
import { fluentDark } from './theme/themes';

function App() {
  const [formats, setFormats] = useState([]);
  const [loadingFormats, setLoadingFormats] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ percent: 0, size: '', speed: '', eta: '' });

  // Called when user submits a video URL
  const handleVideoUrl = async (url) => {
    setVideoUrl(url);
    setFormats([]);
    setSelectedFormat('');
    setError('');
    setLoadingFormats(true);
    try {
      const res = await fetch(`/api/formats?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFormats(data.formats || []);
    } catch (e) {
      setError(e.message || 'Failed to fetch formats');
    } finally {
      setLoadingFormats(false);
    }
  };

  return (
    <ThemeProvider theme={fluentDark}>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)', color: '#fff' }}>
        <SettingsMenu />
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
          <h1 style={{ fontWeight: 700, fontSize: 32, letterSpacing: 1, marginBottom: 32, background: 'linear-gradient(90deg, #00f2fe, #ff6a00, #f80759)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Video Downloader & Trimmer</h1>
          <VideoInput onSubmit={handleVideoUrl} />
          {loadingFormats && <div style={{ color: '#00f2fe', marginBottom: 16 }}>Fetching formats...</div>}
          {error && <div style={{ color: '#f80759', marginBottom: 16 }}>{error}</div>}
          {formats.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <label htmlFor="format-select" style={{ color: '#fff', fontWeight: 600 }}>Select Quality:</label>
              <select
                id="format-select"
                value={selectedFormat}
                onChange={e => setSelectedFormat(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: 8,
                  padding: 12,
                  borderRadius: 8,
                  background: '#181f2e',
                  color: '#00f2fe',
                  border: '1px solid #00f2fe',
                  outline: 'none',
                  fontSize: 16
                }}
              >
                <option value="">Choose a format...</option>
                {formats.map(f => (
                  <option key={f.code} value={f.code}>
                    {`${f.resolution}${f.size ? ` | ${f.size}` : ''}${f.note ? ` | ${f.note}` : ''}`}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            disabled={!selectedFormat}
            style={{
              background: selectedFormat ? 'linear-gradient(90deg, #00f2fe, #ff6a00, #f80759)' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 32px',
              fontSize: 18,
              fontWeight: 700,
              cursor: selectedFormat ? 'pointer' : 'not-allowed',
              filter: selectedFormat ? 'drop-shadow(0 0 8px #00f2fe)' : 'none',
              transition: 'background .2s, filter .2s',
              marginBottom: 32
            }}
            onClick={() => selectedFormat && setShowDownloadModal(true)}
          >
            Download
          </button>
          <DownloadModal
            isOpen={showDownloadModal}
            onDismiss={() => { setShowDownloadModal(false); setDownloadError(''); }}
            onDownload={async ({ filename, folder }) => {
              setShowDownloadModal(false);
              setDownloadError('');
              setDownloading(true);
              setDownloadProgress({ percent: 0, size: '', speed: '', eta: '' });
              try {
                const res = await fetch('/api/download', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    url: videoUrl,
                    format: selectedFormat,
                    filename,
                    folder
                  })
                });
                if (!res.body) throw new Error('No response body');
                const reader = res.body.getReader();
                let buffer = '';
                while (true) {
                  const { value, done } = await reader.read();
                  if (done) break;
                  buffer += new TextDecoder().decode(value);
                  let lines = buffer.split('\n');
                  buffer = lines.pop();
                  for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                      const data = JSON.parse(line);
                      if (data.percent !== undefined) {
                        setDownloadProgress({
                          percent: data.percent,
                          size: data.size,
                          speed: data.speed,
                          eta: data.eta
                        });
                      } else if (data.done) {
                        setDownloading(false);
                        setDownloadProgress({ percent: 100, size: '', speed: '', eta: '' });
                      } else if (data.error) {
                        setDownloadError(data.error);
                        setDownloading(false);
                      }
                    } catch (e) { /* ignore parse errors */ }
                  }
                }
                setDownloading(false);
              } catch (e) {
                setDownloadError(e.message || 'Download failed');
                setDownloading(false);
              }
            }}
            defaultFilename={videoUrl ? `video_${selectedFormat}` : ''}
            defaultFolder={''}
            error={downloadError}
          />
          {downloading && (
            <DownloadProgressBar {...downloadProgress} />
          )}
          {/* Other components will be rendered here as the flow progresses */}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
