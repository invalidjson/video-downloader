import React, { useState } from 'react';
import ThemeSelector from './ThemeSelector';

const SettingsMenu = () => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 100 }}>
      <button
        aria-label="Settings"
        onClick={() => setOpen(!open)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          outline: 'none',
        }}
      >
        <span style={{ fontSize: 32, color: '#00f2fe', filter: 'drop-shadow(0 0 6px #f80759)' }}>&#9776;</span>
      </button>
      {open && (
        <div style={{
          background: '#181f2e',
          borderRadius: 12,
          boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
          padding: 24,
          marginTop: 12,
          minWidth: 220,
        }}>
          <h3 style={{ color: '#00f2fe', marginTop: 0 }}>Settings</h3>
          <ThemeSelector />
        </div>
      )}
    </div>
  );
};
export default SettingsMenu;
