import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import footerImage from '../assets/Screenshot_13.png';

export const generatePDF = async (element, title) => {
  if (!element) {
    console.error('Elemento de preview não encontrado!');
    return;
  }
  
  console.log('--- INICIANDO EXPORTAÇÃO PDF PREMIUM ---');
  try {
    window.scrollTo(0, 0);
    
    // 1. Prepara o elemento: Esconde elementos que o jsPDF vai desenhar manualmente
    const footerDiv = element.querySelector('div.absolute.bottom-0');
    const watermarkDiv = element.querySelector('.pdf-watermark-html') || element.querySelector('div.absolute.inset-0.flex.items-center');
    
    if (footerDiv) footerDiv.style.opacity = '0';
    if (watermarkDiv) watermarkDiv.style.opacity = '0';

    const width = element.offsetWidth;
    const height = element.offsetHeight;
    
    // Captura o conteúdo real (sem marca dagua e rodape do HTML)
    const dataUrl = await toPng(element, { 
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
      width: width,
      height: height,
      style: { shadow: 'none', boxShadow: 'none', margin: '0' }
    });

    // Restaura o estado para o usuário ver no browser
    if (footerDiv) footerDiv.style.opacity = '1';
    if (watermarkDiv) watermarkDiv.style.opacity = '1';
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfHeight = 297;
    const footerHeightMm = 15; // Tarja Intelbras
    const safeContentHeight = pdfHeight - footerHeightMm - 10; // Espaço útil real por página

    let imgHeightMm = (height * pdfWidth) / width;
    let heightLeft = imgHeightMm;
    let position = 0;
    let pageNumber = 1;

    // Função para desenhar Marca d'água e Rodapé em cada nova página
    const addTemplateElements = async (doc) => {
      // 1. Marca d'água Centralizada (Texto Dinâmico)
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.04 }));
      doc.setFont("helvetica", "bold");
      doc.setFontSize(80);
      doc.setTextColor(150, 150, 150);
      doc.text("CONFIDENCIAL", pdfWidth / 2, pdfHeight / 2, {
        align: "center",
        angle: 45
      });
      doc.restoreGraphicsState();

      // 2. Rodapé Intelbras (Tarja Verde)
      try {
        const respF = await fetch(footerImage);
        const blobF = await respF.blob();
        const bufferF = await blobF.arrayBuffer();
        doc.addImage(new Uint8Array(bufferF), 'PNG', 0, pdfHeight - footerHeightMm, pdfWidth, footerHeightMm);
      } catch (e) {
        console.warn('Erro ao carregar rodapé:', e);
      }
    };

    // Primeira página
    pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeightMm, undefined, 'FAST');
    await addTemplateElements(pdf);
    
    heightLeft -= safeContentHeight;

    // Páginas subsequentes
    while (heightLeft > 0) {
      position -= safeContentHeight; // Move o "scroll" da imagem para a próxima parte
      pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeightMm, undefined, 'FAST');
      await addTemplateElements(pdf);
      heightLeft -= safeContentHeight;
      pageNumber++;
    }
    
    const fileName = (title || 'relatorio').replace(/\s+/g, '_');
    pdf.save(`${fileName}.pdf`);
    console.log(`--- EXPORTAÇÃO CONCLUÍDA (${pageNumber} página(s)) ---`);
  } catch (error) { 
    console.error('ERRO FATAL NA EXPORTAÇÃO:', error); 
  }
};
