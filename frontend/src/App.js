import React from 'react';
import VideoInput from './components/VideoInput';
import SettingsMenu from './components/SettingsMenu';
import { ThemeProvider } from 'styled-components';
import { fluentDark } from './theme/themes';

function App() {
  // TODO: Add theme switching logic
  return (
    <ThemeProvider theme={fluentDark}>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)', color: '#fff' }}>
        <SettingsMenu />
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
          <h1 style={{ fontWeight: 700, fontSize: 32, letterSpacing: 1, marginBottom: 32, background: 'linear-gradient(90deg, #00f2fe, #ff6a00, #f80759)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Video Downloader & Trimmer</h1>
          <VideoInput />
          {/* Other components will be rendered here as the flow progresses */}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
