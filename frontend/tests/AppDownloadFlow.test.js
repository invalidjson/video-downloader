import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Polyfill TextEncoder/TextDecoder for JSDOM
global.TextEncoder = global.TextEncoder || require('util').TextEncoder;
global.TextDecoder = global.TextDecoder || require('util').TextDecoder;
// Mock fetch for /api/formats and /api/download
beforeEach(() => {
  global.fetch = jest.fn((url, opts) => {
    if (url.startsWith('/api/formats')) {
      return Promise.resolve({
        json: () => Promise.resolve({ formats: [{ code: 'best', resolution: '1080p' }] })
      });
    }
    if (url === '/api/download') {
      // Simulate a stream of progress and then done, with async chunk delivery
      const encoder = new TextEncoder();
      const chunks = [
        encoder.encode(JSON.stringify({ percent: 10 }) + '\n'),
        encoder.encode(JSON.stringify({ percent: 50, speed: '1MB/s' }) + '\n'),
        encoder.encode(JSON.stringify({ percent: 100 }) + '\n'),
        encoder.encode(JSON.stringify({ done: true }) + '\n')
      ];
      let i = 0;
      return Promise.resolve({
        body: {
          getReader: () => ({
            read: () => {
              if (i < chunks.length) {
                // Yield control to simulate async streaming
                return new Promise(resolve => setTimeout(() => resolve({ value: chunks[i++], done: false }), 10));
              }
              return Promise.resolve({ value: undefined, done: true });
            }
          })
        }
      });
    }
    return Promise.reject(new Error('Unknown endpoint'));
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('App Download Flow', () => {
  it('shows progress and success message after download', async () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/Enter video URL/i), { target: { value: 'https://test' } });
    fireEvent.click(screen.getByText(/Fetch Formats/i));
    await waitFor(() => expect(screen.getByText(/Select Quality/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Select Quality/i), { target: { value: 'best' } });
    fireEvent.click(screen.getByText(/^Download$/));
    fireEvent.change(screen.getByLabelText(/Filename/i), { target: { value: 'video1' } });
    fireEvent.change(screen.getByLabelText(/Folder/i), { target: { value: '/tmp' } });
    fireEvent.click(screen.getByRole('button', { name: /Download/i }));
    // Progress bar should show up (wait for text to appear in the DOM)
    // Progress bar should show up (wait for text to appear in the DOM)
    try {
      await waitFor(() => {
        expect(screen.queryByText(/10.0%/)).toBeInTheDocument();
      }, { timeout: 2000 });
    } catch (e) {
      // Log DOM for debugging
      // eslint-disable-next-line no-console
      console.log('DOM at failure:', screen.debug());
      throw e;
    }
    await waitFor(() => expect(screen.queryByText(/50.0%/)).toBeInTheDocument(), { timeout: 2000 });
    await waitFor(() => expect(screen.queryByText(/100.0%/)).toBeInTheDocument(), { timeout: 2000 });
    // Success message
    expect(await screen.findByTestId('download-feedback')).toHaveTextContent(/Download complete!/i);
  });
});
