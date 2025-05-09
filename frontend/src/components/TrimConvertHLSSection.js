import React, { useState } from 'react';

export default function TrimConvertHLSSection({
  onTrim,
  onConvert,
  onHLS,
  canConvertToMp4,
  isMp4,
  videoFilename,
  downloadFolder
}) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [convert, setConvert] = useState(false);
  const [hls, setHLS] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrim = async () => {
    setLoading(true);
    setStatus('');
    try {
      await onTrim({ start, end });
      setStatus('Trim successful!');
    } catch (e) {
      setStatus('Trim failed: ' + (e.message || e));
    }
    setLoading(false);
  };

  const handleConvert = async () => {
    setLoading(true);
    setStatus('');
    try {
      await onConvert();
      setStatus('Conversion to MP4 successful!');
    } catch (e) {
      setStatus('Conversion failed: ' + (e.message || e));
    }
    setLoading(false);
  };

  const handleHLS = async () => {
    setLoading(true);
    setStatus('');
    try {
      await onHLS();
      setStatus('HLS generation successful!');
    } catch (e) {
      setStatus('HLS generation failed: ' + (e.message || e));
    }
    setLoading(false);
  };

  return (
    <div style={{
      marginTop: 36,
      padding: 28,
      borderRadius: 14,
      background: '#fff',
      boxShadow: '0 2px 12px 0 rgba(60,60,120,0.06)',
      border: '1.5px solid #e6e6ea',
      maxWidth: 600
    }}>
      <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 18 }}>Post-Download Options</h2>
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontWeight: 500 }}>Trim Video:</label>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <input
            type="text"
            placeholder="Start time (e.g. 00:01:00)"
            value={start}
            onChange={e => setStart(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: 140 }}
          />
          <input
            type="text"
            placeholder="End time (e.g. 00:02:30)"
            value={end}
            onChange={e => setEnd(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: 140 }}
          />
          <button
            onClick={handleTrim}
            disabled={loading || !start || !end}
            style={{ padding: '8px 18px', borderRadius: 8, background: '#6c47ff', color: '#fff', border: 'none', fontWeight: 500 }}
          >
            Trim
          </button>
        </div>
      </div>
      {canConvertToMp4 && !isMp4 && (
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 500 }}>Convert to MP4:</label>
          <button
            onClick={handleConvert}
            disabled={loading}
            style={{ marginLeft: 18, padding: '8px 18px', borderRadius: 8, background: '#ff6a00', color: '#fff', border: 'none', fontWeight: 500 }}
          >
            Convert
          </button>
        </div>
      )}
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontWeight: 500 }}>
          <input
            type="checkbox"
            checked={hls}
            onChange={e => setHLS(e.target.checked)}
            style={{ marginRight: 8 }}
            disabled={loading}
          />
          Generate HLS file after processing
        </label>
        <button
          onClick={handleHLS}
          disabled={loading || !hls}
          style={{ marginLeft: 18, padding: '8px 18px', borderRadius: 8, background: '#00f2fe', color: '#222', border: 'none', fontWeight: 500 }}
        >
          Generate HLS
        </button>
      </div>
      {status && <div style={{ color: status.includes('failed') ? '#f80759' : '#00b894', marginTop: 18, fontWeight: 500 }}>{status}</div>}
    </div>
  );
}
