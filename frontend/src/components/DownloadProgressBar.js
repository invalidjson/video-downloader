import React from 'react';
import styled from 'styled-components';

const ProgressBarContainer = styled.div`
  width: 100%;
  background: #232b39;
  border-radius: 8px;
  margin: 16px 0;
  height: 28px;
  box-shadow: 0 0 8px #00ffe7;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 8px;
  background: linear-gradient(90deg, #00ffe7, #00f2fe, #ff6a00);
  transition: width 0.3s;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: #232b39;
  font-weight: 700;
  font-size: 16px;
  padding-right: 16px;
`;

export default function DownloadProgressBar({ percent, size, speed, eta }) {
  return (
    <ProgressBarContainer>
      <ProgressFill style={{ width: `${percent || 0}%` }}>
        {percent ? `${percent.toFixed(1)}%${size ? ' • ' + size : ''}${speed ? ' • ' + speed : ''}${eta ? ' • ETA ' + eta : ''}` : ''}
      </ProgressFill>
    </ProgressBarContainer>
  );
}
