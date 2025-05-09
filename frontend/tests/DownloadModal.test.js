import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DownloadModal from '../src/components/DownloadModal';

describe('DownloadModal', () => {
  it('renders and validates input', async () => {
    const onDownload = jest.fn();
    const onDismiss = jest.fn();
    render(
      <DownloadModal
        isOpen={true}
        onDismiss={onDismiss}
        onDownload={onDownload}
        defaultFilename=""
        defaultFolder=""
        error=""
      />
    );
    expect(await screen.findByLabelText(/Filename/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/Folder/i)).toBeInTheDocument();
    const downloadBtn = await screen.findByRole('button', { name: /Download/i });
    expect(downloadBtn).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/Filename/i), { target: { value: 'myvideo' } });
    await waitFor(() => expect(downloadBtn).toBeDisabled());
    fireEvent.change(screen.getByLabelText(/Folder/i), { target: { value: '/videos' } });
    await waitFor(() => expect(downloadBtn).not.toBeDisabled());
    fireEvent.click(downloadBtn);
    expect(onDownload).toHaveBeenCalledWith({ filename: 'myvideo', folder: '/videos' });
  });

  it('shows error message', () => {
    render(
      <DownloadModal
        isOpen={true}
        onDismiss={() => {}}
        onDownload={() => {}}
        defaultFilename=""
        defaultFolder=""
        error="Test error!"
      />
    );
    expect(screen.getByText(/Test error!/i)).toBeInTheDocument();
  });
});
