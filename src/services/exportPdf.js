import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import footerImage from '../assets/Screenshot_13.png';

/**
 * Gera um documento PDF de múltiplas páginas a partir de um elemento DOM usando html-to-image e jsPDF.
 * Fatias do container são geradas visualmente ao buscar por classes de página específicas.
 * 
 * @param {HTMLElement} containerElement - O elemento DOM raiz contendo os nós `.pdf-page`.
 * @param {string} title - O nome do arquivo gerado.
 */
export const generatePDF = async (containerElement, title) => {
  if (!containerElement) {
    console.error('[ExportPDF] Preview container not found.');
    return;
  }
  
  console.log('[ExportPDF] Initialzing multi-page export pipeline...');
  try {
    const pages = containerElement.querySelectorAll('.pdf-page');
    if (pages.length === 0) {
      console.warn('[ExportPDF] No pages detected. Aborting export.');
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfHeight = 297;

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      
      const indicator = page.querySelector('.absolute.top-4.right-8');
      if (indicator) indicator.style.display = 'none';

      const dataUrl = await toPng(page, { 
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: page.offsetWidth,
        height: page.offsetHeight
      });

      if (indicator) indicator.style.display = 'block';

      if (i > 0) pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    }

    
    const fileName = (title || 'report').replace(/\s+/g, '_');
    pdf.save(`${fileName}.pdf`);
    console.log(`[ExportPDF] Successfully exported ${pages.length} pages.`);
  } catch (error) { 
    console.error('[ExportPDF] Error rendering PDF:', error); 
  }
};
