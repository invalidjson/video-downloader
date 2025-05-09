import React from 'react';

const themes = [
  'Fluent Dark',
  'Nord',
  'Darcula',
  'Gruvbox',
  'City Lights',
  'Solarized Dark',
  'Solarized Light',
  'Material',
  'Fluent Light'
];

const ThemeSelector = () => (
  <div>
    <label style={{ color: '#fff', fontWeight: 600 }}>Theme:</label>
    <select style={{
      width: '100%',
      marginTop: 8,
      padding: 8,
      borderRadius: 6,
      background: '#222b3a',
      color: '#00f2fe',
      border: '1px solid #00f2fe',
      outline: 'none',
      fontSize: 16
    }}>
      {themes.map(t => <option key={t} value={t}>{t}</option>)}
    </select>
  </div>
);
export default ThemeSelector;
