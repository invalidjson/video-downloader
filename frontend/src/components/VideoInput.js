import React, { useState } from 'react';
import styled from 'styled-components';

const Input = styled.input`
  flex: 1;
  font-size: 1.5rem;
  padding: 18px 24px;
  border: 1.5px solid #e6e6ea;
  border-radius: 14px;
  background: #fff;
  color: #222;
  font-family: inherit;
  font-weight: 400;
  outline: none;
  transition: border 0.2s;
  &:focus {
    border: 1.5px solid #6c47ff;
  }
`;
const Button = styled.button`
  font-size: 1.4rem;
  padding: 18px 32px;
  border: none;
  border-radius: 14px;
  background: #6c47ff;
  color: #fff;
  font-family: inherit;
  font-weight: 500;
  margin-left: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  outline: none;
  box-shadow: none;
  display: flex;
  align-items: center;
  &:focus {
    outline: 3px solid #a7a4fc;
    outline-offset: 2px;
    box-shadow: none;
  }
  &:disabled {
    background: #e6e6ea;
    color: #b0b0b8;
    cursor: not-allowed;
  }
`;
const Form = styled.form`
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 40px;
`;
const VideoInput = ({ onSubmit }) => {
  const [url, setUrl] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(url);
  };
  return (
    <Form onSubmit={handleSubmit}>
      <Input
        type="text"
        value={url}
        onChange={e => setUrl(e.target.value)}
        required
        placeholder="Paste a video URL..."
        aria-label="Video URL"
      />
      <Button type="submit" disabled={!url}>
        Fetch Formats
      </Button>
    </Form>
  );
};
export default VideoInput;
