import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock fetch for /api/formats and /api/download
beforeEach(() => {
  global.fetch = jest.fn((url, opts) => {
    if (url.startsWith('/api/formats')) {
      return Promise.resolve({
        json: () => Promise.resolve({ formats: [{ code: 'best', resolution: '1080p' }] })
      });
    }
    if (url === '/api/download') {
      // Simulate a stream of progress and then done
      const encoder = new TextEncoder();
      const chunks = [
        encoder.encode(JSON.stringify({ percent: 10 }) + '\n'),
        encoder.encode(JSON.stringify({ percent: 50, speed: '1MB/s' }) + '\n'),
        encoder.encode(JSON.stringify({ percent: 100, done: true }) + '\n')
      ];
      let i = 0;
      return Promise.resolve({
        body: {
          getReader: () => ({
            read: () => {
              if (i < chunks.length) {
                return Promise.resolve({ value: chunks[i++], done: false });
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
    // Progress bar should show up
    expect(await screen.findByText(/10.0%/i)).toBeInTheDocument();
    expect(await screen.findByText(/50.0%/i)).toBeInTheDocument();
    expect(await screen.findByText(/100.0%/i)).toBeInTheDocument();
    // Success message
    expect(await screen.findByTestId('download-feedback')).toHaveTextContent(/Download complete!/i);
  });
});
