import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import footerImage from '../assets/Screenshot_13.png';

export const generatePDF = async (element, title) => {
  if (!element) {
    console.error('Elemento de preview não encontrado!');
    return;
  }
  
  console.log('--- INICIANDO EXPORTAÇÃO PDF ---');
  try {
    window.scrollTo(0, 0);
    
    // Identifica o rodapé e remove restrições de altura temporariamente
    const footerDiv = element.querySelector('div.absolute.bottom-0');
    if (footerDiv) footerDiv.style.display = 'none';

    // Guardamos os estilos originais para restaurar depois
    const originalMinHeight = element.style.minHeight;
    const originalPaddingBottom = element.style.paddingBottom;

    // Forçamos o elemento a ter apenas a altura do seu conteúdo real
    element.style.setProperty('min-height', '0', 'important');
    element.style.setProperty('padding-bottom', '0', 'important');

    const width = element.offsetWidth;
    const height = element.offsetHeight;
    
    const dataUrl = await toPng(element, { 
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
      width: width,
      height: height,
      style: {
        shadow: 'none',
        boxShadow: 'none',
        margin: '0',
        transform: 'none'
      }
    });

    // Restaura o estado original para o usuário na web
    if (footerDiv) footerDiv.style.display = 'block';
    element.style.minHeight = originalMinHeight;
    element.style.paddingBottom = originalPaddingBottom;
    
    console.log('Captura concluída. Montando PDF A4 com rodapé fixo...');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = 210;
    const pdfHeight = 297;
    const footerHeightMm = 15; // Altura reservada para o rodapé no PDF

    // Cálculo proporcional do conteúdo
    let imgHeightMm = (height * pdfWidth) / width;
    
    // CLAMPING: Se a altura for levemente superior a uma página A4 (até 1cm de sobra),
    // forçamos a escala para caber em uma única página, evitando folhas fantasma.
    if (imgHeightMm > 297 && imgHeightMm < 307) {
      imgHeightMm = 297;
      console.log('Ajustando escala para caber em 1 página.');
    }
    
    let heightLeft = imgHeightMm;
    let position = 0;
    let pageNumber = 1;

    // Função interna para adicionar o rodapé em uma página
    const addFooterToPage = async (doc) => {
      try {
        const respF = await fetch(footerImage);
        const blobF = await respF.blob();
        const bufferF = await blobF.arrayBuffer();
        // Adiciona a tarja verde no rodapé (posicionada no final da folha A4)
        doc.addImage(new Uint8Array(bufferF), 'PNG', 0, pdfHeight - footerHeightMm, pdfWidth, footerHeightMm);
      } catch (e) {
        console.warn('Erro ao carregar imagem do rodapé para o PDF:', e);
      }
    };

    // Primeira página
    pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeightMm, undefined, 'FAST');
    await addFooterToPage(pdf);
    
    heightLeft -= pdfHeight;

    // Páginas subsequentes (Tolerância de 10mm para ignorar rodapés e margens vazias do navegador)
    while (heightLeft > 10) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeightMm, undefined, 'FAST');
      await addFooterToPage(pdf);
      heightLeft -= pdfHeight;
      pageNumber++;
    }
    
    const fileName = (title || 'relatorio').replace(/\s+/g, '_');
    pdf.save(`${fileName}.pdf`);
    console.log(`--- EXPORTAÇÃO CONCLUÍDA (${pageNumber} página(s)) ---`);
  } catch (error) { 
    console.error('ERRO FATAL:', error); 
  }
};
