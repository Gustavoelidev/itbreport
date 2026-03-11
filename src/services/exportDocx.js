import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, ShadingType, BorderStyle, Footer, Table, TableRow, TableCell, WidthType, Header, HorizontalPositionAlign, VerticalPositionAlign, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, TextWrappingType } from "docx";
import intelbrasLogo from '../assets/intelbras-logo.svg';
import footerImage from '../assets/Screenshot_13.png';

const svgToPngBlob = (svgUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      // Força uma resolução nativa altíssima no momento da "foto" do canvas pra não ficar embaçado
      const scale = 5;
      // Garante que se o SVG não tiver dimensionamento base, ele assume um padrão visual retangular
      const baseW = img.width || 120;
      const baseH = img.height || 35;
      
      const canvas = document.createElement('canvas');
      canvas.width = baseW * scale;
      canvas.height = baseH * scale;
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, 'image/png', 1.0);
    };
    img.onerror = reject;
    img.src = svgUrl;
  });
};

export const generateDOCX = async (reportData) => {
  const children = [];

  // Logo (Converted to PNG to avoid Word corruption)
  try {
    const pngBlob = await svgToPngBlob(intelbrasLogo);
    const logoBuffer = await pngBlob.arrayBuffer();
    children.push(new Paragraph({
      alignment: AlignmentType.RIGHT,
      // Aumentado drasticamente o tamanho de renderização dentro do Papel A4 do Docx
      children: [new ImageRun({ data: logoBuffer, transformation: { width: 220, height: 45 } })],
      spacing: { after: 400 }
    }));
  } catch (e) { console.warn('Erro ao converter logo SVG para PNG:', e); }

  // Title & Header Info
  children.push(
    new Paragraph({
      children: [new TextRun({ text: (reportData.title || '[TÍTULO DO RELATÓRIO]').toUpperCase(), bold: true, size: 36, font: "Calibri" })],
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: "000000", space: 10 } }
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: reportData.qaName || "NOME DO ANALISTA", bold: true, size: 28, font: "Calibri" })],
      spacing: { before: 200 }
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: reportData.role || "Cargo", size: 24, font: "Calibri" })]
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: reportData.email, size: 20, font: "Calibri", color: "00A335", bold: true })]
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: (reportData.date || '').toUpperCase(), size: 18, font: "Calibri", color: "9CA3AF", bold: true })],
      spacing: { before: 200, after: 800 }
    })
  );

  const multiLineText = (text, isCode = false) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => new Paragraph({
      children: [new TextRun({ 
        text: line, 
        size: isCode ? 20 : 24, 
        font: isCode ? "Courier New" : "Calibri",
        color: isCode ? "333333" : "000000"
      })],
      spacing: { after: isCode ? 0 : 100 },
      ...(isCode && {
          shading: {
              type: ShadingType.SOLID,
              color: "F3F4F6",
              fill: "F3F4F6",
          },
          indent: { left: 400, right: 400 },
          keepNext: idx < lines.length - 1,
          keepLines: true
      })
    }));
  };

  const createSectionHeader = (text) => new Paragraph({ 
    children: [new TextRun({ text: text, bold: true, size: 24, font: "Calibri" })],
    spacing: { before: 400, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "D1D5DB", space: 6 } }
  });

  // Sections
  children.push(createSectionHeader("1. INTRODUÇÃO"));
  children.push(...multiLineText(reportData.introduction));

  children.push(createSectionHeader("2. OBJETIVO"));
  children.push(...multiLineText(reportData.objectives));

  children.push(createSectionHeader("3. INFRAESTRUTURA"));
  reportData.infrastructure.forEach(infra => {
    children.push(new Paragraph({ 
      children: [
        new TextRun({ text: `[${infra.type}] `, bold: true, font: "Calibri", size: 24 }),
        new TextRun({ text: `${infra.model || 'Não especificado'} ${infra.type !== 'CLOUD' && infra.firmware ? `- Firmware: ${infra.firmware}` : ''}`, font: "Calibri", size: 24 })
      ],
      spacing: { after: 120 }
    }));
  });

  children.push(createSectionHeader("4. CONFIGURAÇÕES DE AMBIENTE (PRÉ-REQUISITOS)"));
  children.push(...multiLineText(reportData.prerequisites));

  children.push(createSectionHeader("5. RESULTADOS DE TESTES"));
  
  const noBorder = {
    top: { style: BorderStyle.NONE, size: 0, color: "auto" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
    left: { style: BorderStyle.NONE, size: 0, color: "auto" },
    right: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
  };

  for (const [index, test] of reportData.tests.entries()) {
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noBorder,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: noBorder,
                width: { size: 70, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: `CENÁRIO ${index + 1}: ${(test.scenario || 'Teste sem título').toUpperCase()}`, bold: true, size: 24, font: "Calibri" })],
                    spacing: { before: 300, after: 150 }
                  })
                ]
              }),
              new TableCell({
                borders: noBorder,
                width: { size: 30, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [new TextRun({ text: `[STATUS: ${test.status.toUpperCase()}]`, bold: true, size: 20, font: "Calibri", color: test.status === 'Pass' ? '16A34A' : 'DC2626' })],
                    spacing: { before: 300, after: 150 }
                  })
                ]
              })
            ]
          })
        ]
      })
    );

    children.push(new Paragraph({ 
      children: [
        new TextRun({ text: "Descrição: ", bold: true, size: 22, font: "Calibri" }), 
        new TextRun({ text: test.description, size: 22, font: "Calibri" })
      ],
      spacing: { after: 150 }
    }));

    children.push(new Paragraph({ 
      children: [new TextRun({ text: "Passos:", bold: true, size: 22, font: "Calibri" })],
      spacing: { after: 80 }
    }));
    children.push(...multiLineText(test.steps));

    if (test.codeBlocks && test.codeBlocks.length > 0) {
      test.codeBlocks.forEach(block => {
        if (block.description) {
          children.push(new Paragraph({ 
            children: [new TextRun({ text: block.description.toUpperCase(), bold: true, size: 16, font: "Calibri", color: "6B7280" })],
            spacing: { before: 200, after: 50 },
            keepNext: true
          }));
        }
        children.push(...multiLineText(block.content, true));
      });
    }

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noBorder,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: noBorder,
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "ESPERADO", bold: true, size: 16, font: "Calibri", color: "9CA3AF" })],
                    spacing: { before: 200, after: 50 }
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: test.expectedResult, size: 22, font: "Calibri" })],
                    spacing: { after: 200 }
                  })
                ]
              }),
              new TableCell({
                borders: noBorder,
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "OBTIDO", bold: true, size: 16, font: "Calibri", color: "9CA3AF" })],
                    spacing: { before: 200, after: 50 }
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: test.actualResult || "Conforme esperado.", size: 22, font: "Calibri" })],
                    spacing: { after: 200 }
                  })
                ]
              })
            ]
          })
        ]
      })
    );

    if (test.evidences && test.evidences.length > 0) {
      children.push(new Paragraph({ 
        children: [new TextRun({ text: "EVIDÊNCIAS TÉCNICAS", bold: true, size: 20, font: "Calibri", color: "9CA3AF" })],
        spacing: { before: 200, after: 100 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB", space: 2 } }
      }));

      for (const evidence of test.evidences) {
        try {
          const response = await fetch(evidence.url);
          const eBlob = await response.blob();
          const eBuffer = await eBlob.arrayBuffer();
          children.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new ImageRun({ data: eBuffer, transformation: { width: 450, height: 300 } })],
            spacing: { before: 200 }
          }));
          if (evidence.description) {
            children.push(new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: evidence.description, italic: true, size: 20, font: "Calibri", color: "6B7280" })],
              spacing: { before: 50, after: 200 }
            }));
          }
        } catch (e) { console.error(e); }
      }
    }
  }

  let footerConfig = undefined;

  // Footer Logo (Native Word Footer)
  try {
    const respF = await fetch(footerImage);
    const blobF = await respF.blob();
    const bufferF = await blobF.arrayBuffer();
    
    const footerContent = new Paragraph({
      alignment: AlignmentType.CENTER,
      // Indent negativo absoluto para ignorar laterais e chegar no fim da folha
      indent: { left: -750, right: -750 },
      children: [new ImageRun({ data: bufferF, transformation: { width: 800, height: 60 } })]
    });

    footerConfig = {
      default: new Footer({ children: [footerContent] }),
      first: new Footer({ children: [footerContent] })
    };
  } catch (e) { console.warn('Erro ao montar Footer nativo:', e); }

  let headerConfig = undefined;

  // Watermark "CONFIDENCIAL" (Native Word Header with Floating Image Background)
  try {
    const wmSvgString = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100"><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="140" font-family="Calibri, sans-serif" font-weight="bold" fill="#000000" opacity="0.04" transform="rotate(-45 400 550)">CONFIDENCIAL</text></svg>';
    const wmSvgUrl = 'data:image/svg+xml;base64,' + btoa(wmSvgString);
    const wmBlob = await svgToPngBlob(wmSvgUrl);
    const wmBuffer = await wmBlob.arrayBuffer();

    const headerContent = new Paragraph({
      children: [
        new ImageRun({
          data: wmBuffer,
          transformation: { width: 800, height: 1100 },
          floating: {
            horizontalPosition: {
              relative: HorizontalPositionRelativeFrom.PAGE,
              align: HorizontalPositionAlign.CENTER,
            },
            verticalPosition: {
              relative: VerticalPositionRelativeFrom.PAGE,
              align: VerticalPositionAlign.CENTER,
            },
            wrap: {
              type: TextWrappingType.NONE,
            },
            behindDocument: true,
          }
        })
      ]
    });

    headerConfig = {
      default: new Header({ children: [headerContent] }),
      first: new Header({ children: [headerContent] })
    };
  } catch (e) { console.warn('Erro ao montar Watermark:', e); }

  // Set tight margins to allow full edge-to-edge images and A4 sizing
  const doc = new Document({ 
    sections: [{ 
      properties: { 
        titlePage: true,
        page: {
            margin: {
                top: 700,
                right: 700,
                bottom: 1100, // Limite seguro para o texto principal não invadir a imagem do rodapé
                left: 700,
                footer: 0,
            },
        },
      },
      headers: headerConfig || {},
      ...(footerConfig ? { footers: footerConfig } : {}),
      children 
    }] 
  });
  
  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const fileName = (reportData.title || 'relatorio').replace(/\s+/g, '_');
  a.download = `${fileName}.docx`;
  a.click();
};
