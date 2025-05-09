import React from 'react';
import styled from 'styled-components';
import { Dialog, DialogType, DialogFooter, PrimaryButton, DefaultButton, TextField } from '@fluentui/react';

const ModalContainer = styled.div`
  .ms-Dialog-main {
    background: #181c24;
    color: #fff;
    border-radius: 12px;
    box-shadow: 0 0 16px #00ffe7;
  }
  .ms-Dialog-title {
    color: #00ffe7;
  }
`;

export default function DownloadModal({
  isOpen,
  onDismiss,
  onDownload,
  defaultFilename = '',
  defaultFolder = '',
  error = '',
}) {
  const [filename, setFilename] = React.useState(defaultFilename);
  const [folder, setFolder] = React.useState(defaultFolder);

  React.useEffect(() => {
    setFilename(defaultFilename);
    setFolder(defaultFolder);
  }, [defaultFilename, defaultFolder, isOpen]);

  const handleDownload = () => {
    if (!filename.trim() || !folder.trim()) return;
    onDownload({ filename: filename.trim(), folder: folder.trim() });
  };

  return (
    <ModalContainer>
      <Dialog
        hidden={!isOpen}
        onDismiss={onDismiss}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Download Video',
          subText: 'Choose a filename and folder for your download.',
        }}
        modalProps={{ isBlocking: true }}
      >
        <TextField
          label="Filename"
          value={filename}
          onChange={(_, v) => setFilename(v)}
          required
        />
        <TextField
          label="Folder"
          value={folder}
          onChange={(_, v) => setFolder(v)}
          required
        />
        {error && <div style={{ color: '#ff4f4f', marginTop: 8 }}>{error}</div>}
        <DialogFooter>
          <PrimaryButton onClick={handleDownload} text="Download" disabled={!filename.trim() || !folder.trim()} />
          <DefaultButton onClick={onDismiss} text="Cancel" />
        </DialogFooter>
      </Dialog>
    </ModalContainer>
  );
}
