import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import footerImage from '../assets/Screenshot_13.png';

export const generatePDF = async (containerElement, title) => {
  if (!containerElement) {
    console.error('Container de preview não encontrado!');
    return;
  }
  
  console.log('--- INICIANDO EXPORTAÇÃO PDF MULTI-PÁGINA ---');
  try {
    // Busca todas as div que representam páginas reais
    const pages = containerElement.querySelectorAll('.pdf-page');
    if (pages.length === 0) {
      console.warn('Nenhuma página detectada. Usando fallback...');
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfHeight = 297;

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      
      // Esconde o indicador visual de página "A4 PAGE" que colocamos na web
      const indicator = page.querySelector('.absolute.top-4.right-8');
      if (indicator) indicator.style.display = 'none';

      // Captura a página individualmente
      const dataUrl = await toPng(page, { 
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: page.offsetWidth,
        height: page.offsetHeight
      });

      // Restaura o indicador
      if (indicator) indicator.style.display = 'block';

      // Se não for a primeira página, adiciona uma nova folha ao PDF
      if (i > 0) pdf.addPage();

      // Adiciona a imagem da página cobrindo toda a folha A4
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

      // Marca d'água via código (Extra camada de segurança/qualidade)
      pdf.saveGraphicsState();
      pdf.setGState(new pdf.GState({ opacity: 0.04 }));
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(80);
      pdf.setTextColor(150, 150, 150);
      pdf.text("CONFIDENCIAL", pdfWidth / 2, pdfHeight / 2, {
        align: "center",
        angle: 45
      });
      pdf.restoreGraphicsState();
    }
    
    const fileName = (title || 'relatorio').replace(/\s+/g, '_');
    pdf.save(`${fileName}.pdf`);
    console.log(`--- EXPORTAÇÃO CONCLUÍDA (${pages.length} páginas) ---`);
  } catch (error) { 
    console.error('ERRO NA EXPORTAÇÃO PDF:', error); 
  }
};
