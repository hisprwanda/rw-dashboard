import { Button, Modal, ModalContent, ModalActions, InputField, SingleSelectField, SingleSelectOption } from '@dhis2/ui';
import { useState } from 'react';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import PptxGenJS from 'pptxgenjs';

const ExportModal: React.FC<{ setIsShowExportModal: (isOpen: boolean) => void; visualizationRef: React.RefObject<HTMLDivElement>; }> = ({ setIsShowExportModal, visualizationRef }) => {
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('png');

  const handleExport = () => {
    if (visualizationRef.current) {
      if (fileType === 'pdf') {
        htmlToImage.toCanvas(visualizationRef.current)
          .then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            pdf.addImage(imgData, 'PNG', 10, 10, 180, 160);
            pdf.save(`${fileName}.pdf`);
          })
          .catch((error) => {
            console.error('Export to PDF failed:', error);
          });
      } else if (fileType === 'ppt') {
        htmlToImage.toBlob(visualizationRef.current)
          .then((blob) => {
            const reader = new FileReader();
            reader.onload = () => {
              const pptx = new PptxGenJS();
              const slide = pptx.addSlide();
              slide.addImage({ data: reader.result as string, x: 0.5, y: 0.5, w: 8, h: 5 });
              pptx.writeFile({ fileName: `${fileName}.pptx` });
            };
            reader.readAsDataURL(blob);
          })
          .catch((error) => {
            console.error('Export to PPT failed:', error);
          });
      } else {
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
          <SingleSelectOption value="pdf" label="PDF" />
          <SingleSelectOption value="ppt" label="PowerPoint" />
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