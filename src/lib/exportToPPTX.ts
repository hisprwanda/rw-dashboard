import pptxgen from 'pptxgenjs';
import html2canvas from 'html2canvas';

interface ExportToPPTXProps {
  dashboardName: string;
  selectedVisuals: any[];
  backgroundColor: string;
}

export const exportToPPTX = async ({ dashboardName, selectedVisuals, backgroundColor }: ExportToPPTXProps) => {
  // Create a new PowerPoint presentation
  const pres = new pptxgen();
  
  // Set presentation properties
  pres.author = 'Dashboard Export';
  pres.title = dashboardName;
  
  // Create title slide
  const titleSlide = pres.addSlide();
  titleSlide.background = { color: backgroundColor };
  titleSlide.addText(dashboardName, {
    x: '25%',
    y: '40%',
    w: '50%',
    fontSize: 44,
    bold: true,
    align: 'center'
  });
  
  // Process each visual
  for (const visual of selectedVisuals) {
    try {
      // Create temporary container for the visual
      const container = document.createElement('div');
      container.style.width = '800px'; // Fixed width for consistent output
      container.style.height = '600px';
      container.style.backgroundColor = backgroundColor;
      container.style.padding = '20px';
      
      // Clone the visual content
      const visualElement = document.querySelector(`[data-visual-id="${visual.i}"]`)?.cloneNode(true) as HTMLElement;
      if (!visualElement) continue;
      
      container.appendChild(visualElement);
      document.body.appendChild(container);
      
      // Capture the visual as an image
      const canvas = await html2canvas(container, {
        allowTaint: true,
        useCORS: true,
        scale: 2, // Higher resolution
        logging: false
      });
      
      // Remove temporary container
      document.body.removeChild(container);
      
      // Convert canvas to base64
      const imageData = canvas.toDataURL('image/png');
      
      // Add new slide for this visual
      const slide = pres.addSlide();
      
      // Add visual title
      slide.addText(visual.visualName, {
        x: '5%',
        y: '5%',
        w: '90%',
        fontSize: 24,
        bold: true
      });
      
      // Add visual image
      slide.addImage({
        data: imageData,
        x: '10%',
        y: '20%',
        w: '80%',
        h: '70%'
      });
      
    } catch (error) {
      console.error(`Error processing visual ${visual.visualName}:`, error);
    }
  }
  
  // Save the presentation
  const fileName = `${dashboardName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.pptx`;
  await pres.writeFile({ fileName });
};