import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, ShadingType, BorderStyle, Footer, Table, TableRow, TableCell, WidthType, Header, HorizontalPositionAlign, VerticalPositionAlign, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, TextWrappingType } from "docx";
import intelbrasLogo from '../assets/intelbras-logo.svg';
import footerImage from '../assets/Screenshot_13.png';

const svgToPngBlob = (svgUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const scale = 5;
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

const parseRichText = (text, options = {}) => {
  if (!text) return [new TextRun({ text: "", ...options })];
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map(part => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return new TextRun({ text: part.slice(2, -2), bold: true, ...options });
    }
    return new TextRun({ text: part, ...options });
  });
};

export const generateDOCX = async (reportData, t) => {
  const children = [];

  // Logo
  try {
    const pngBlob = await svgToPngBlob(intelbrasLogo);
    const logoBuffer = await pngBlob.arrayBuffer();
    children.push(new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new ImageRun({ data: logoBuffer, transformation: { width: 220, height: 45 } })],
      spacing: { after: 400 }
    }));
  } catch (e) { console.warn('Erro ao converter logo SVG:', e); }

  // Header Info
  children.push(
    new Paragraph({
      children: [new TextRun({ text: (reportData.title || t.identification.title.toUpperCase()).toUpperCase(), bold: true, size: 36, font: "Calibri" })],
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: "000000", space: 10 } }
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: reportData.qaName || t.identification.qaName.toUpperCase(), bold: true, size: 28, font: "Calibri" })],
      spacing: { before: 200 }
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: reportData.role || t.identification.role, size: 24, font: "Calibri" })]
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
    if (!text) return [];
    const lines = text.split('\n');
    return lines.map((line, idx) => new Paragraph({
      children: isCode 
        ? [new TextRun({ text: line, size: 20, font: "Courier New", color: "333333" })]
        : parseRichText(line, { size: 24, font: "Calibri", color: "000000" }),
      spacing: { after: isCode ? 0 : 100 },
      ...(isCode && {
          shading: { type: ShadingType.SOLID, color: "F3F4F6", fill: "F3F4F6" },
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

  children.push(createSectionHeader(t.preview.introduction));
  children.push(...multiLineText(reportData.introduction));
  children.push(createSectionHeader(t.preview.objectives));
  children.push(...multiLineText(reportData.objectives));

  children.push(createSectionHeader(t.preview.infrastructure));
  reportData.infrastructure.forEach(infra => {
    children.push(new Paragraph({ 
      children: [
        new TextRun({ text: `[${infra.type}] `, bold: true, font: "Calibri", size: 24 }),
        new TextRun({ text: `${infra.model || 'N/A'} ${infra.type !== 'CLOUD' && infra.firmware ? `- Firmware: ${infra.firmware}` : ''}`, font: "Calibri", size: 24 })
      ],
      spacing: { after: 120 }
    }));
  });

  children.push(createSectionHeader(t.preview.prerequisites));
  children.push(...multiLineText(reportData.prerequisites));

  children.push(createSectionHeader(t.preview.testResults));
  
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
                    children: [new TextRun({ text: `${t.testExecution.scenarioLabel.toUpperCase()} ${index + 1}: ${(test.scenario || '...').toUpperCase()}`, bold: true, size: 24, font: "Calibri" })],
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
                    children: [new TextRun({ text: `[STATUS: ${test.status === 'Pass' ? t.testExecution.status.pass : t.testExecution.status.fail}]`, bold: true, size: 20, font: "Calibri", color: test.status === 'Pass' ? '16A34A' : 'DC2626' })],
                    spacing: { before: 300, after: 150 }
                  })
                ]
              })
            ]
          })
        ]
      })
    );

    if (test.description) {
      children.push(new Paragraph({ 
        children: [
          new TextRun({ text: `${t.testExecution.objectiveLabel}: `, bold: true, size: 22, font: "Calibri" }), 
          ...parseRichText(test.description, { size: 22, font: "Calibri" })
        ],
        spacing: { after: 150 }
      }));
    }

    if (test.blocks && test.blocks.length > 0) {
      for (const block of test.blocks) {
        if (!block.content && block.type !== 'image' && block.type !== 'list') continue;

        if (block.type === 'subtopic') {
          children.push(new Paragraph({ 
            children: parseRichText(block.content.toUpperCase(), { bold: true, size: 20, font: "Calibri", color: "1F2937" }),
            spacing: { before: 300, after: 100 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "F3F4F6", space: 1 } }
          }));
        }

        if (block.type === 'step') {
          children.push(...multiLineText(block.content));
        }

        if (block.type === 'list' && block.items) {
          block.items.filter(i => i.text.trim()).forEach((item) => {
            children.push(new Paragraph({
              children: parseRichText(item.text, { size: 22, font: "Calibri" }),
              bullet: block.listType === 'bullet' ? { level: 0 } : undefined,
              numbering: block.listType === 'number' ? { reference: 'main-numbering', level: 0 } : undefined,
              spacing: { after: 100 },
              indent: { left: 720, hanging: 360 }
            }));
          });
        }

        if (block.type === 'code') {
          if (block.description) {
            children.push(new Paragraph({ 
              children: parseRichText(`↳ ${block.description.toUpperCase()}`, { bold: true, size: 16, font: "Calibri", color: "6B7280" }),
              spacing: { before: 100, after: 50 },
              keepNext: true
            }));
          }
          children.push(...multiLineText(block.content, true));
        }

        if (block.type === 'image' && block.content) {
          try {
            const imgResponse = await fetch(block.content);
            const imgBlob = await imgResponse.blob();
            const imgBuffer = await imgBlob.arrayBuffer();
            children.push(new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new ImageRun({ data: imgBuffer, transformation: { width: 450, height: 280 } })],
              spacing: { before: 200, after: 100 }
            }));
            if (block.description) {
              children.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                children: parseRichText(`${t.preview.fig} ${block.description}`, { italic: true, size: 18, font: "Calibri", color: "6B7280" }),
                spacing: { after: 200 }
              }));
            }
          } catch (e) { console.error("Erro no DOCX:", e); }
        }
      }
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
                    children: [new TextRun({ text: t.preview.expected.toUpperCase(), bold: true, size: 16, font: "Calibri", color: "9CA3AF" })],
                    spacing: { before: 300, after: 50 }
                  }),
                  new Paragraph({
                    children: parseRichText(test.expectedResult || "N/A", { size: 22, font: "Calibri" }),
                    spacing: { after: 200 }
                  })
                ]
              }),
              new TableCell({
                borders: noBorder,
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: t.preview.actual.toUpperCase(), bold: true, size: 16, font: "Calibri", color: "9CA3AF" })],
                    spacing: { before: 300, after: 50 }
                  }),
                  new Paragraph({
                    children: parseRichText(test.actualResult || (test.status === 'Pass' ? 'OK' : 'FAIL'), { size: 22, font: "Calibri", color: test.status === 'Pass' ? '16A34A' : 'DC2626' }),
                    spacing: { after: 200 }
                  })
                ]
              })
            ]
          })
        ]
      })
    );
  }

  let footerConfig = undefined;
  try {
    const respF = await fetch(footerImage);
    const blobF = await respF.blob();
    const bufferF = await blobF.arrayBuffer();
    const footerContent = new Paragraph({
      alignment: AlignmentType.CENTER,
      indent: { left: -750, right: -750 },
      children: [new ImageRun({ data: bufferF, transformation: { width: 800, height: 60 } })]
    });
    footerConfig = { default: new Footer({ children: [footerContent] }) };
  } catch (e) { console.warn('Erro Footer:', e); }

  let headerConfig = undefined;
  try {
    const wmSvgString = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100"><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="100" font-family="Calibri, sans-serif" font-weight="bold" fill="#000000" opacity="0.04" transform="rotate(-45 400 550)">${t.preview.confidential}</text></svg>`;
    const wmSvgUrl = 'data:image/svg+xml;base64,' + btoa(wmSvgString);
    const wmBlob = await svgToPngBlob(wmSvgUrl);
    const wmBuffer = await wmBlob.arrayBuffer();

    const headerContent = new Paragraph({
      children: [
        new ImageRun({
          data: wmBuffer,
          transformation: { width: 800, height: 1100 },
          floating: {
            horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, align: HorizontalPositionAlign.CENTER },
            verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, align: VerticalPositionAlign.CENTER },
            wrap: { type: TextWrappingType.NONE },
            behindDocument: true,
          }
        })
      ]
    });
    headerConfig = { default: new Header({ children: [headerContent] }) };
  } catch (e) { console.warn('Erro Watermark:', e); }

  const doc = new Document({ 
    numbering: {
        config: [
            {
                reference: "main-numbering",
                levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
            }
        ]
    },
    sections: [{ 
      properties: { 
        titlePage: true,
        page: { margin: { top: 700, right: 700, bottom: 1100, left: 700, footer: 0 } },
      },
      headers: headerConfig || {},
      footers: footerConfig || {},
      children 
    }] 
  });
  
  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(reportData.title || 'relatorio').replace(/\s+/g, '_')}.docx`;
  a.click();
};
