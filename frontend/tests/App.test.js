import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  it('renders the title and video input', () => {
    render(<App />);
    expect(screen.getByText(/Video Downloader & Trimmer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Video URL/i)).toBeInTheDocument();
    expect(screen.getByText(/Fetch Formats/i)).toBeInTheDocument();
  });

  it('shows quality dropdown after fetching formats', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ formats: [
        { code: '22', resolution: '1280x720', size: '2.3MiB', note: '720p' },
        { code: '18', resolution: '640x360', size: '1.2MiB', note: '360p' }
      ] })
    });
    render(<App />);
    fireEvent.change(screen.getByLabelText(/Video URL/i), { target: { value: 'https://test' } });
    fireEvent.click(screen.getByText(/Fetch Formats/i));
    await waitFor(() => expect(screen.getByText(/Select Quality/i)).toBeInTheDocument());
    expect(screen.getByText(/1280x720 | 2.3MiB | 720p/)).toBeInTheDocument();
    expect(screen.getByText(/640x360 | 1.2MiB | 360p/)).toBeInTheDocument();
    global.fetch.mockRestore();
  });
});
