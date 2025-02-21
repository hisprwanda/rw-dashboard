import { useState } from 'react';
import pptxgen from 'pptxgenjs';
import html2canvas from 'html2canvas';
import { useToast } from "../components/ui/use-toast";

interface Visual {
  i: string;
  visualName: string;
  [key: string]: any;
}

interface ExportToPPTXOptions {
  dashboardName: string;
  selectedVisuals: Visual[];
  backgroundColor: string;
  author?: string;
}

interface UsePPTXExportReturn {
  exportToPPTX: (options: ExportToPPTXOptions) => Promise<void>;
  isExporting: boolean;
}

/**
 * Custom hook for exporting dashboard visuals to PowerPoint
 * @returns Object containing export function and loading state
 */
export const usePPTXExport = (): UsePPTXExportReturn => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToPPTX = async (options: ExportToPPTXOptions): Promise<void> => {
    if (isExporting) return;
    
    const { dashboardName, selectedVisuals, backgroundColor, author = 'Dashboard Export' } = options;
    
    setIsExporting(true);
    
    try {
      // Create new PowerPoint presentation
      const pres = new pptxgen();
      
      // Set presentation properties
      pres.author = author;
      pres.title = dashboardName;
      pres.layout = 'LAYOUT_16x9';
      
      // Create title slide
      const titleSlide = pres.addSlide();
      titleSlide.background = { color: backgroundColor };
      titleSlide.addText(dashboardName, {
        x: '10%',
        y: '40%',
        w: '80%',
        fontSize: 44,
        bold: true,
        align: 'center',
        color: '#000000'
      });
      
      // Process each visual
      for (const visual of selectedVisuals) {
        try {
          // Find the actual visual element in the DOM
          const originalVisual = document.querySelector(`[data-visual-id="${visual.i}"]`);
          if (!originalVisual) continue;
          
          // Get the original dimensions from the grid layout
          const originalRect = originalVisual.getBoundingClientRect();
          const aspectRatio = originalRect.width / originalRect.height;
          
          // Create temporary container with original proportions
          const container = document.createElement('div');
          container.style.position = 'fixed';
          container.style.left = '-9999px';
          container.style.top = '-9999px';
          container.style.backgroundColor = backgroundColor;
          document.body.appendChild(container);

          // Clone the visual content
          const visualClone = originalVisual.cloneNode(true) as HTMLElement;
          
          // Preserve the original width/height ratio
          visualClone.style.width = `${originalRect.width}px`;
          visualClone.style.height = `${originalRect.height}px`;
          visualClone.style.overflow = 'visible';
          visualClone.style.position = 'relative';
          
          // Remove UI elements not needed for export
          const deleteButton = visualClone.querySelector('.delete-button');
          if (deleteButton) deleteButton.remove();

          const dragHandle = visualClone.querySelector('.drag-handle');
          if (dragHandle) (dragHandle as HTMLElement).style.pointerEvents = 'none';

          container.appendChild(visualClone);

          // Wait for any charts/visualizations to render
          await new Promise(resolve => setTimeout(resolve, 500));

          // Capture the visual with its original dimensions
          const canvas = await html2canvas(visualClone, {
            allowTaint: true,
            useCORS: true,
            scale: 2,
            logging: false,
            backgroundColor: null
          });

          // Remove temporary container
          document.body.removeChild(container);

          // Convert canvas to base64
          const imageData = canvas.toDataURL('image/png');

          // Add new slide
          const slide = pres.addSlide();
          slide.background = { color: backgroundColor };

          // Add visual title
          slide.addText(visual.visualName, {
            x: '5%',
            y: '3%',
            w: '90%',
            fontSize: 24,
            bold: true,
            color: '#000000',
            align: 'center'
          });

          // Calculate optimal placement based on aspect ratio
          let imgX, imgY, imgW, imgH;
          
          // Standard slide dimensions (16:9 ratio)
          const slideWidth = 10;  // in inches
          const slideHeight = 5.625;  // in inches
          const maxImgWidth = slideWidth * 0.9;  // 90% of slide width
          const maxImgHeight = slideHeight * 0.75;  // 75% of slide height
          
          if (aspectRatio > (maxImgWidth / maxImgHeight)) {
            // Wider than tall - constrain by width
            imgW = maxImgWidth;
            imgH = imgW / aspectRatio;
            imgX = (slideWidth - imgW) / 2;
            imgY = (slideHeight - imgH) / 2 + 0.5; // Add offset for title
          } else {
            // Taller than wide - constrain by height
            imgH = maxImgHeight;
            imgW = imgH * aspectRatio;
            imgX = (slideWidth - imgW) / 2;
            imgY = (slideHeight - imgH) / 2 + 0.5; // Add offset for title
          }

          // Add visual image with calculated dimensions
          slide.addImage({
            data: imageData,
            x: imgX,
            y: imgY,
            w: imgW,
            h: imgH,
          });
        } catch (error) {
          console.error(`Error processing visual ${visual.visualName}:`, error);
        }
      }

      // Save the presentation
      const fileName = `${dashboardName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.pptx`;
      await pres.writeFile({ fileName });
      
      toast({
        title: "Export Complete",
        description: "PowerPoint file has been downloaded",
        variant: "default",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting to PowerPoint",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToPPTX, isExporting };
};