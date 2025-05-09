import React, { useState } from 'react';
import VideoInput from './components/VideoInput';
import DownloadModal from './components/DownloadModal';

import TrimConvertHLSSection from './components/TrimConvertHLSSection';
import { API_BASE_URL } from './config';

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
  const [downloadMessage, setDownloadMessage] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(null); // null | true | false

  // Called when user submits a video URL
  const handleVideoUrl = async (url) => {
    setVideoUrl(url);
    setFormats([]);
    setSelectedFormat('');
    setError('');
    setLoadingFormats(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/formats?url=${encodeURIComponent(url)}`);
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
    <div style={{ minHeight: '100vh', background: 'transparent', color: '#222', fontFamily: 'Inter, Helvetica Neue, Arial, sans-serif', fontWeight: 200, padding: 0, position: 'relative', overflow: 'hidden' }}>
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0
        }}
      >
        <source src="/assets/background.mp4" type="video/mp4" />
      </video>
      {/* Black overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.7)',
        zIndex: 1
      }} />
      {/* Main content */}
      <style>{`
        *:focus {
          outline: 2px solid;
          outline-color: transparent;
          box-shadow: 0 0 0 3px
            linear-gradient(90deg, #00f2fe, #00ffe7, #00c3ff, #00e0ff);
          transition: box-shadow 0.2s;
        }
        input, select, button, textarea {
          font-weight: 200 !important;
        }
      `}</style>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px 24px 24px', position: 'relative', zIndex: 2 }}>
        <h1 style={{ fontWeight: 200, fontSize: 48, letterSpacing: '-1px', marginBottom: 40, color: '#222', fontFamily: 'Inter, Helvetica Neue, Arial, sans-serif', lineHeight: 1.1 }}>Video Downloader</h1>
        <VideoInput onSubmit={handleVideoUrl} />
          {loadingFormats && <div style={{ color: '#00f2fe', marginBottom: 16 }}>Fetching formats...</div>}
          {error && <div style={{ color: '#f80759', marginBottom: 16 }}>{error}</div>}
          {formats.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <label htmlFor="format-select" style={{ color: '#222', fontWeight: 500, fontSize: 22, marginBottom: 10, display: 'block', fontFamily: 'inherit' }}>Select Quality:</label>
              <select
                id="format-select"
                value={selectedFormat}
                onChange={e => setSelectedFormat(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: 10,
                  padding: '18px 24px',
                  borderRadius: 14,
                  background: '#fff',
                  color: '#222',
                  border: '1.5px solid #e6e6ea',
                  outline: 'none',
                  fontSize: '1.3rem',
                  fontFamily: 'inherit',
                  fontWeight: 400,
                  marginBottom: 0,
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  boxShadow: '0 2px 8px 0 rgba(60,60,120,0.04)'
                }}
              >
                <option value="">Choose a format...</option>
                {formats.map(f => (
                  <option key={f.code} value={f.code}>
                    {`${f.resolution}${f.size ? ` ${f.size}` : ''} ${f.note && f.note.toLowerCase().includes('storyboard') ? 'storyboard' : f.note && f.note.toLowerCase().includes('audio') ? 'audio' : f.note && f.note.toLowerCase().includes('video') ? 'video' : f.ext}`}

                  </option>
                ))}
              </select>
            </div>
          )}
          {formats.length > 0 && selectedFormat && !downloading && (
            <button
              style={{
                background: '#6c47ff',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                padding: '18px 32px',
                fontSize: '1.4rem',
                fontWeight: 500,
                marginTop: 18,
                marginBottom: 32,
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 2px 8px 0 rgba(60,60,120,0.04)',
                transition: 'box-shadow 0.2s',
                display: 'block',
                width: '100%',
              }}
              onClick={() => setShowDownloadModal(true)}
            >
              Download
            </button>
          )}
          {downloading && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.7)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  }}>
    <div style={{
      width: '75vw',
      height: '75vh',
      background: 'rgba(24,31,46,0.95)',
      borderRadius: 24,
      boxShadow: '0 8px 32px 0 rgba(0,0,0,0.35)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <img src="/assets/downloading.gif" alt="Downloading..." style={{ width: 480, height: 480, objectFit: 'contain', marginBottom: 32 }} />
      <div style={{ color: '#00f2fe', fontWeight: 300, fontSize: 32, letterSpacing: 1 }}>Downloading...</div>
    </div>
  </div>
)}
          <DownloadModal
            isOpen={showDownloadModal}
            onDismiss={() => { setShowDownloadModal(false); setDownloadError(''); }}
            onDownload={async ({ filename, folder }) => {
              setShowDownloadModal(false);
              setDownloadError('');
              setDownloadMessage('');
              setDownloadSuccess(null);
              setDownloading(true);
              setDownloadProgress({ percent: 0, size: '', speed: '', eta: '' });
              try {
                const res = await fetch(`${API_BASE_URL}/api/download`, {
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
                let success = false;
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
                        setDownloadMessage('Download complete!');
                        setDownloadSuccess(true);
                        success = true;
                      } else if (data.error) {
                        setDownloadError(data.error);
                        setDownloadMessage(data.error);
                        setDownloadSuccess(false);
                        setDownloading(false);
                      }
                    } catch (e) { /* ignore parse errors */ }
                  }
                }
                if (!success && downloadSuccess === null) {
                  setDownloadMessage('Download failed or interrupted.');
                  setDownloadSuccess(false);
                }
                setDownloading(false);
              } catch (e) {
                setDownloadError(e.message || 'Download failed');
                setDownloadMessage(e.message || 'Download failed');
                setDownloadSuccess(false);
                setDownloading(false);
              }
            }}
            defaultFilename={videoUrl ? `video_${selectedFormat}` : ''}
            defaultFolder={''}
            error={downloadError}
          />
          {downloadMessage && (
            <div
              style={{
                margin: '24px 0',
                padding: '20px 26px',
                borderRadius: 14,
                background: '#f4f4f8',
                color: '#222',
                fontWeight: 500,
                fontSize: 22,
                border: '1.5px solid #e6e6ea',
                boxShadow: '0 2px 12px 0 rgba(60,60,120,0.06)',
                textAlign: 'center'
              }}
              data-testid="download-feedback"
            >
              {downloadMessage}
            </div>
          )}
          {downloadSuccess === true && (
            <TrimConvertHLSSection
              videoFilename={videoUrl ? `video_${selectedFormat}` : ''}
              downloadFolder={''}
              canConvertToMp4={selectedFormat && formats.find(f => f.code === selectedFormat && f.ext !== 'mp4')}
              isMp4={selectedFormat && formats.find(f => f.code === selectedFormat && f.ext === 'mp4')}
              onTrim={async ({ start, end }) => {
                const res = await fetch(`${API_BASE_URL}/api/trim`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ filename: videoUrl ? `video_${selectedFormat}` : '', start, end })
                });
                if (!res.ok) throw new Error('Trim failed');
                return res.json();
              }}
              onConvert={async () => {
                const res = await fetch(`${API_BASE_URL}/api/convert`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ filename: videoUrl ? `video_${selectedFormat}` : '' })
                });
                if (!res.ok) throw new Error('Convert failed');
                return res.json();
              }}
              onHLS={async () => {
                const res = await fetch(`${API_BASE_URL}/api/hls`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ filename: videoUrl ? `video_${selectedFormat}` : '' })
                });
                if (!res.ok) throw new Error('HLS generation failed');
                return res.json();
              }}
            />
          )}

        </div>
      </div>
    );
}

export default App;
