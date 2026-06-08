import React, { forwardRef, useEffect, useState, useRef } from 'react';
import PreviewHeader from './PreviewHeader';
import PreviewTestResults from './PreviewTestResults';
import footerImage from '../../assets/Screenshot_13.png';

const Page = ({ children, t, showHeader = false, reportData, pageNumber }) => {
  const calibriStack = '"Calibri", "Candara", "Segoe UI", "Optima", "Arial", sans-serif';
  
  return (
    <div
      className="pdf-page bg-white w-[210mm] min-h-[297mm] h-[297mm] shadow-2xl px-[2cm] pt-[2cm] pb-[2.5cm] flex flex-col relative overflow-hidden text-black mb-8 select-none"
      style={{ fontFamily: calibriStack, lineHeight: '1.4' }}
    >
      {/* Marca D'água Ténica (Background) */}
      {!reportData.isPublic && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0" style={{ opacity: 0.03 }}>
          <div className="text-[80px] font-black tracking-[10px] -rotate-45 whitespace-nowrap uppercase">{t.preview.confidential}</div>
        </div>
      )}

      <div className="relative z-10 flex-1">
        {showHeader && <PreviewHeader reportData={reportData} t={t} />}
        <div className={showHeader ? "mt-8" : ""}>
          {children}
        </div>
      </div>

      {/* Rodapé Fixo (A4 Layout) */}
      <div className="absolute bottom-0 left-0 w-full bg-white z-20">
        <img src={footerImage} alt="Rodapé Intelbras" className="w-full object-bottom" style={{ maxHeight: '60px' }} />
      </div>

      {/* Apenas UI: Indicador de Número da Página */}
      <div className="absolute bottom-4 right-8 text-[10px] text-gray-300 font-mono italic">
        PAGE {pageNumber}
      </div>
    </div>
  );
};

const DocumentPreview = forwardRef(({ reportData, t }, ref) => {
  const [pages, setPages] = useState([]);
  const [measuring, setMeasuring] = useState(true);
  const measurerRef = useRef(null);

  /**
   * Motor de Paginação Dinâmica:
   * Mede a altura absoluta de "átomos" estruturais individuais fora do DOM para construir páginas A4 visualmente precisas.
   */
  useEffect(() => {
    const paginate = () => {
      if (!measurerRef.current) return;

      const items = Array.from(measurerRef.current.children);
      if (items.length === 0) {
        setPages([]);
        setMeasuring(false);
        return;
      }

      const PAGE_1_MAX_H = 820; // Otimizado para preencher mais a página
      const PAGE_N_MAX_H = 920;
      
      const newPages = [];
      let currentPageItems = [];
      let pageTop = items[0].getBoundingClientRect().top;

      items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const relativeBottom = rect.bottom - pageTop;
        const forceBreak = item.getAttribute('data-force-break') === 'true';
        
        // Define o limite atual dependendo de qual página estamos construindo
        const currentLimit = newPages.length === 0 ? PAGE_1_MAX_H : PAGE_N_MAX_H;

        // Força quebra se exceder limite OU se o elemento tiver a marcação de quebra forçada
        const shouldBreak = (relativeBottom > currentLimit) || forceBreak;

        if (shouldBreak) {
          if (currentPageItems.length > 0) {
            newPages.push(currentPageItems);
            currentPageItems = [index];
            pageTop = rect.top;
          } else if (newPages.length === 0 && forceBreak) {
            // Regra: se o primeiro item do relatório já exige quebra (ex: Cenário de Teste sem Intro),
            // a Página 1 ficará apenas como Capa, e o conteúdo inicia na Página 2.
            newPages.push([]); 
            currentPageItems = [index];
            pageTop = rect.top;
          } else {
            currentPageItems.push(index);
          }
        } else {
          currentPageItems.push(index);
        }
      });

      if (currentPageItems.length > 0) newPages.push(currentPageItems);
      setPages(newPages);
      setMeasuring(false);
    };

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        paginate();
      });
    });

    if (measurerRef.current) {
      resizeObserver.observe(measurerRef.current);
    }

    return () => {
      if (measurerRef.current) resizeObserver.unobserve(measurerRef.current);
      resizeObserver.disconnect();
    };
  }, [reportData, t]);

  useEffect(() => {
    setMeasuring(true);
  }, [reportData]);

  const renderRichText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (typeof part === 'string' && part.startsWith('**') && part.endsWith('**')) {
        return <span key={i} className="font-bold">{part.slice(2, -2)}</span>;
      }
      return part;
    });
  };

  const chunkText = (text, maxLength = 600) => {
    if (!text) return [];
    const chunks = [];
    let currentChunk = '';
    const paragraphs = text.split('\n');

    for (const p of paragraphs) {
      if (p.length > maxLength) {
        const words = p.split(' ');
        let temp = '';
        for (const w of words) {
          // Se uma única palavra for bizarramente grande (ex: hash), força a quebra
          if (w.length > maxLength) {
            if (temp) { chunks.push(temp); temp = ''; }
            if (currentChunk) { chunks.push(currentChunk); currentChunk = ''; }
            for (let k = 0; k < w.length; k += maxLength) {
              chunks.push(w.slice(k, k + maxLength));
            }
            continue;
          }
          if (temp.length + w.length + 1 > maxLength) {
            if (currentChunk) { chunks.push(currentChunk); currentChunk = ''; }
            chunks.push(temp.trim());
            temp = w + ' ';
          } else {
            temp += w + ' ';
          }
        }
        if (temp.trim()) {
          if (currentChunk.length + temp.length > maxLength) {
            chunks.push(currentChunk);
            currentChunk = temp.trim();
          } else {
            currentChunk += (currentChunk ? '\n' : '') + temp.trim();
          }
        }
      } else {
        if (currentChunk.length + p.length > maxLength) {
          chunks.push(currentChunk);
          currentChunk = p;
        } else {
          currentChunk += (currentChunk ? '\n' : '') + p;
        }
      }
    }
    if (currentChunk) chunks.push(currentChunk);
    return chunks;
  };

  /**
   * Traduz o estado estruturado do relatório em átomos de DOM mensuráveis.
   */
  const renderAtoms = (isMeasuring = false) => {
    const atoms = [];
    let sectionCounter = 1;

    const getSectionHeader = (field, defaultLabel) => {
      const customLabel = reportData.customLabels?.[field];
      const label = (reportData.isPublic && customLabel) ? customLabel : defaultLabel;
      return reportData.isPublic ? label : `${sectionCounter++}. ${label}`;
    };

    const renderBaseImages = (images) => {
      if (!images || images.length === 0) return null;
      
      const widthMap = {
        '100%': 'w-full',
        '50%': 'w-[calc(50%-8px)]',
        '25%': 'w-[calc(25%-12px)]'
      };

      atoms.push(
        <div key={`img-group-${Math.random()}`} className="flex flex-wrap justify-center gap-4 mb-4 atom break-inside-avoid">
          {images.map(img => (
            <img key={img.id} src={img.url} className={`${widthMap[img.size] || 'w-full'} rounded object-contain`} style={{ maxHeight: '400px' }} alt="Documentação" />
          ))}
        </div>
      );
    };

    if (reportData.introduction) {
      atoms.push(<h2 key="intro-h" className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300 atom">{getSectionHeader('introduction', t.preview.introduction)}</h2>);
      chunkText(reportData.introduction, 600).forEach((chunk, i) => {
        atoms.push(<p key={`intro-p-${i}`} className="text-[12px] text-justify whitespace-pre-wrap break-words leading-relaxed mb-4 atom">{renderRichText(chunk) || ' '}</p>);
      });
      renderBaseImages(reportData.introductionImages);
    }

    if (reportData.objectives) {
      atoms.push(<h2 key="obj-h" className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300 atom">{getSectionHeader('objectives', t.preview.objectives)}</h2>);
      chunkText(reportData.objectives, 600).forEach((chunk, i) => {
        atoms.push(<p key={`obj-p-${i}`} className="text-[12px] text-justify whitespace-pre-wrap break-words leading-relaxed mb-4 atom">{renderRichText(chunk) || ' '}</p>);
      });
      renderBaseImages(reportData.objectivesImages);
    }

    if (reportData.prerequisites) {
      atoms.push(<h2 key="pre-h" className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300 atom">{getSectionHeader('prerequisites', t.preview.prerequisites)}</h2>);
      chunkText(reportData.prerequisites, 600).forEach((chunk, i) => {
        atoms.push(<p key={`pre-p-${i}`} className="text-[12px] text-justify whitespace-pre-wrap break-words leading-relaxed mb-4 atom">{renderRichText(chunk) || ' '}</p>);
      });
      renderBaseImages(reportData.prerequisitesImages);
    }

    if (reportData.topology || (reportData.topologyImages && reportData.topologyImages.length > 0)) {
      atoms.push(<h2 key="topo-h" className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300 atom">{getSectionHeader('topology', t.preview.topology || 'Topologia')}</h2>);
      if (reportData.topology) {
        chunkText(reportData.topology, 600).forEach((chunk, i) => {
          atoms.push(<p key={`topo-p-${i}`} className="text-[12px] text-justify whitespace-pre-wrap break-words leading-relaxed mb-4 atom">{renderRichText(chunk) || ' '}</p>);
        });
      }
      renderBaseImages(reportData.topologyImages);
    }

    const activeInfra = reportData.infrastructure?.filter(item => item.type !== 'NONE') || [];
    if (activeInfra.length > 0) {
      atoms.push(
        <section key="infra" className="mb-8 atom break-inside-avoid">
          <h2 className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300">{getSectionHeader('infrastructure', t.preview.infrastructure)}</h2>
          <div className="text-[11px] grid grid-cols-2 gap-x-8 gap-y-1">
            {activeInfra.map((item, i) => (
              <p key={i} className="flex gap-2">
                <span className="font-bold shrink-0">[{item.type === 'MOBILE' ? 'Celular' : item.type}]</span>
                <span className="truncate">{item.model || 'N/A'}{item.type !== 'CLOUD' && item.firmware ? ` (FW: ${item.firmware})` : ''}</span>
              </p>
            ))}
          </div>
        </section>
      );
    }

    if (reportData.tests && reportData.tests.length > 0) {
      if (!reportData.isPublic) {
        atoms.push(
          <h2 
            key="test-header" 
            data-force-break="true" 
            className="text-[12px] font-bold uppercase mb-6 border-b border-gray-300 atom"
          >
            {getSectionHeader('testResults', t.preview.testResults)}
          </h2>
        );
      }
      
      reportData.tests.forEach((test, idx) => {
        atoms.push(
          <div 
            key={`test-head-${test.id}`} 
            data-force-break={idx > 0 ? "true" : "false"}
            className="flex justify-between items-end border-b-2 border-slate-900 pb-1 mt-8 mb-6 atom"
          >
            <h4 className="text-[14px] font-black uppercase tracking-tighter">
              {reportData.isPublic ? (test.scenario || '...') : `${t.testExecution.scenarioLabel} ${idx + 1}: ${test.scenario || '...'}`}
            </h4>
            {!reportData.isPublic && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                test.status === 'Pass' ? 'text-green-700 border-green-200 bg-green-50' : 'text-red-700 border-red-200 bg-red-50'
              }`}>
                {test.status === 'Pass' ? t.testExecution.status.pass : t.testExecution.status.fail}
              </span>
            )}
          </div>
        );

        if (test.description) {
          chunkText(test.description, 600).forEach((chunk, i) => {
            atoms.push(
              <div key={`test-desc-${test.id}-chunk-${i}`} className={`bg-slate-50 p-3 border-l-4 border-slate-200 atom break-inside-avoid ${i === 0 ? 'rounded-t-md mt-2' : ''} ${i === chunkText(test.description, 600).length - 1 ? 'rounded-b-md mb-6' : ''}`}>
                <p className="text-[11px] text-gray-600 italic leading-relaxed whitespace-pre-wrap">
                  {i === 0 && <span className="font-bold text-slate-800 not-italic uppercase text-[9px] mr-2">{t.testExecution.objectiveLabel}:</span>}
                  {renderRichText(chunk)}
                </p>
              </div>
            );
          });
        }

        if (test.blocks && test.blocks.length > 0) {
          test.blocks.forEach((block, bidx) => {
            if (block.type === 'step' && block.content) {
              chunkText(block.content, 400).forEach((chunk, i) => {
                atoms.push(
                  <div key={`test-block-${test.id}-${block.id}-line-${i}`} className="atom break-inside-avoid">
                    <p className="whitespace-pre-wrap break-words text-gray-700 leading-relaxed pl-1 text-[11px] min-h-[16px]">
                      {renderRichText(chunk) || ' '}
                    </p>
                  </div>
                );
              });
            } else if (block.type === 'code' && block.content) {
              const lines = block.content.split('\n');
              lines.forEach((line, i) => {
                const isFirst = i === 0;
                const isLast = i === lines.length - 1;
                atoms.push(
                  <div key={`test-block-${test.id}-${block.id}-line-${i}`} className="atom break-inside-avoid">
                    {isFirst && block.description && (
                      <p className="text-[9px] font-bold text-gray-400 uppercase ml-1 mb-1.5 mt-2">
                        ↳ {renderRichText(block.description)}
                      </p>
                    )}
                    <div className={`bg-gray-100 px-4 py-0 border-x border-gray-200 flex flex-col ${isFirst ? 'rounded-t-sm border-t pt-4 mt-2' : ''} ${isLast ? 'rounded-b-sm border-b pb-4 mb-2' : ''}`}>
                      <pre className="text-[10px] whitespace-pre-wrap break-all m-0 leading-tight" style={{ fontFamily: '"Consolas", "Monaco", "Courier New", monospace' }}>
                        {line || ' '}
                      </pre>
                    </div>
                  </div>
                );
              });
            } else if (block.type === 'spacer') {
              const isPageBreak = block.spacerType === 'page_break';
              const heightMap = {
                small: '20px',
                medium: '40px',
                large: '80px'
              };
              const height = isPageBreak ? '0px' : (heightMap[block.spacerHeight] || '40px');
              atoms.push(
                <div 
                  key={`test-block-${test.id}-${block.id}`} 
                  data-force-break={isPageBreak ? "true" : "false"}
                  className="atom"
                  style={{ height }}
                />
              );
            } else {
              atoms.push(
                <div key={`test-block-${test.id}-${block.id}`} className="mb-6 atom">
                  <PreviewTestResults tests={[{ ...test, blocks: [block] }]} t={t} onlyBlocks={true} />
                </div>
              );
            }
          });
        }

        if (!reportData.isPublic) {
          atoms.push(
            <div key={`test-res-${test.id}`} className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100 border-dashed mt-8 mb-12 atom break-inside-avoid">
              <div className="space-y-1">
                <span className="font-bold block text-[9px] text-gray-400 tracking-widest uppercase">{t.preview.expected}</span>
                <p className="text-[11px] text-gray-700 font-medium whitespace-pre-wrap break-words">{renderRichText(test.expectedResult) || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold block text-[9px] text-gray-400 tracking-widest uppercase">{t.preview.actual}</span>
                <p className={`text-[11px] font-medium whitespace-pre-wrap break-words ${test.status === 'Pass' ? 'text-green-700' : 'text-red-700'}`}>
                  {renderRichText(test.actualResult) || (test.status === 'Pass' ? 'OK' : 'FAIL')}
                </p>
              </div>
            </div>
          );
        } else {
          atoms.push(<div key={`test-res-${test.id}-spacer`} className="mb-12 atom break-inside-avoid" />);
        }
      });
    }

    if (reportData.conclusion) {
      atoms.push(<h2 key="conc-h" className="text-[12px] font-bold uppercase mt-8 mb-4 border-b border-gray-300 atom">{getSectionHeader('conclusion', t.preview.conclusion)}</h2>);
      
      const lines = reportData.conclusion.split('\n');
      lines.forEach((line, i) => {
        atoms.push(
          <div key={`conc-line-${i}`} className="atom break-inside-avoid">
            <p className="text-[12px] text-justify whitespace-pre-wrap break-words leading-relaxed m-0 min-h-[16px]">
              {renderRichText(line) || ' '}
            </p>
          </div>
        );
      });
      renderBaseImages(reportData.conclusionImages);
    }

    return atoms;
  };

  const allAtoms = renderAtoms();

  return (
    <div ref={ref} className="flex flex-col items-center">
      {/* Container Invisível para Medição de Altura */}
      <div 
        ref={measurerRef} 
        className="absolute opacity-0 pointer-events-none w-[210mm] px-[2cm] py-[2cm]"
        style={{ zIndex: -100, visibility: 'hidden', height: 'auto' }}
      >
        {allAtoms}
      </div>

      {/* Saída Real do Renderizador (Páginas A4 Visíveis) */}
      {pages.length > 0 ? (
        pages.map((pageAtomIndexes, idx) => (
          <Page 
            key={idx} 
            t={t} 
            showHeader={idx === 0} 
            reportData={reportData} 
            pageNumber={idx + 1}
          >
            {pageAtomIndexes.map(atomIdx => (
              <div key={atomIdx}>{allAtoms[atomIdx]}</div>
            ))}
          </Page>
        ))
      ) : (
        <Page t={t} showHeader={true} reportData={reportData} pageNumber={1}>
           <div className="flex flex-col items-center justify-center h-[200mm] text-gray-300 italic">
              Aguardando conteúdo...
           </div>
        </Page>
      )}
    </div>
  );
});

export default DocumentPreview;
