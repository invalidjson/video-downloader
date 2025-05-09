import React, { useState } from 'react';
import { TextField, PrimaryButton } from '@fluentui/react';

const VideoInput = ({ onSubmit }) => {
  const [url, setUrl] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(url);
  };
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 32 }}>
      <TextField label="Video URL" value={url} onChange={(_, v) => setUrl(v)} required style={{ flex: 1 }} placeholder="Enter video URL" />
      <PrimaryButton type="submit" text="Fetch Formats" disabled={!url} style={{ background: 'linear-gradient(90deg, #00f2fe, #ff6a00, #f80759)', border: 'none' }} />
    </form>
  );
};
export default VideoInput;
