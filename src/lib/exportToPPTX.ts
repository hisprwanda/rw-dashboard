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
  
  // Set default slide size to 16:9 ratio
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
      // Find the actual visual element
      const originalVisual = document.querySelector(`[data-visual-id="${visual.i}"]`);
      if (!originalVisual) continue;

      // Create temporary container
      const container = document.createElement('div');
      container.style.width = '1600px'; // Wider for better quality
      container.style.height = '900px'; // 16:9 ratio
      container.style.backgroundColor = backgroundColor;
      container.style.position = 'fixed'; // Position offscreen
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      document.body.appendChild(container);

      // Clone the visual content
      const visualClone = originalVisual.cloneNode(true) as HTMLElement;
      
      // Remove any scroll bars and make content fully visible
      visualClone.style.overflow = 'visible';
      visualClone.style.width = '100%';
      visualClone.style.height = '100%';
      
      // Remove the delete button if it exists
      const deleteButton = visualClone.querySelector('.delete-button');
      if (deleteButton) {
        deleteButton.remove();
      }

      // Clean up the visual for export
      const dragHandle = visualClone.querySelector('.drag-handle');
      if (dragHandle) {
        dragHandle.remove();
      }

      container.appendChild(visualClone);

      // Wait for any charts/visualizations to render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture the visual
      const canvas = await html2canvas(container, {
        allowTaint: true,
        useCORS: true,
        scale: 2,
        logging: false,
        width: 1600,
        height: 900,
        backgroundColor: backgroundColor
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

      // Add visual image with proper sizing
      slide.addImage({
        data: imageData,
        x: '5%',
        y: '15%',
        w: '90%',
        h: '80%',
        sizing: {
          type: 'contain',
          w: '90%',
          h: '80%'
        }
      });

    } catch (error) {
      console.error(`Error processing visual ${visual.visualName}:`, error);
    }
  }

  // Save the presentation
  const fileName = `${dashboardName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.pptx`;
  await pres.writeFile({ fileName });
};