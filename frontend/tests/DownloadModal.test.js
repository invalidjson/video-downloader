import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DownloadModal from '../src/components/DownloadModal';

describe('DownloadModal', () => {
  it('renders and validates input', () => {
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
    expect(screen.getByLabelText(/Filename/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Folder/i)).toBeInTheDocument();
    const downloadBtn = screen.getByRole('button', { name: /Download/i });
    expect(downloadBtn).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/Filename/i), { target: { value: 'myvideo' } });
    expect(downloadBtn).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/Folder/i), { target: { value: '/videos' } });
    expect(downloadBtn).not.toBeDisabled();
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
