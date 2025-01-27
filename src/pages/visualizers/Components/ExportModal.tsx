import { Button, Modal, ModalContent, ModalActions, InputField, SingleSelectField, SingleSelectOption } from '@dhis2/ui';
import { useState } from 'react';
import * as htmlToImage from 'html-to-image';

const ExportModal: React.FC<{ setIsShowExportModal: (isOpen: boolean) => void; visualizationRef: React.RefObject<HTMLDivElement>; }> = ({ setIsShowExportModal, visualizationRef }) => {
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('png');

  const handleExport = () => {
    if (visualizationRef.current) {
      htmlToImage.toBlob(visualizationRef.current, { type: `image/${fileType}` })
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${fileName}.${fileType}`;
          a.click();
          URL.revokeObjectURL(url);
        })
        .catch((error) => {
          console.error('Export failed:', error);
        });
    }
    setIsShowExportModal(false);
  };

  return (
    <Modal onClose={() => setIsShowExportModal(false)}>
      <ModalContent>
        <InputField
          label="File Name"
          value={fileName}
          onChange={({ value }) => setFileName(value)}
        />
        <SingleSelectField
          label="File Type"
          selected={fileType}
          onChange={({ selected }) => setFileType(selected)}
        >
          <SingleSelectOption value="png" label="PNG" />
          <SingleSelectOption value="jpeg" label="JPEG" />
          <SingleSelectOption value="svg" label="SVG" />
        </SingleSelectField>
      </ModalContent>
      <ModalActions>
        <Button onClick={handleExport} primary>
          Save
        </Button>
        <Button onClick={() => setIsShowExportModal(false)}>
          Cancel
        </Button>
      </ModalActions>
    </Modal>
  );
};

export default ExportModal;