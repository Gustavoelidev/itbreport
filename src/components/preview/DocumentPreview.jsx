import React, { forwardRef, useEffect, useState, useRef } from 'react';
import PreviewHeader from './PreviewHeader';
import PreviewTestResults from './PreviewTestResults';
import footerImage from '../../assets/Screenshot_13.png';

const Page = ({ children, t, showHeader = false, reportData, pageNumber }) => {
  const calibriStack = '"Calibri", "Candara", "Segoe UI", "Optima", "Arial", sans-serif';
  
  return (
    <div
      className="pdf-page bg-white w-[210mm] min-h-[297mm] h-[297mm] shadow-2xl px-[2cm] pt-[2cm] pb-[2.2cm] flex flex-col relative overflow-hidden text-black mb-8 select-none"
      style={{ fontFamily: calibriStack, lineHeight: '1.4' }}
    >
      {/* Marca d'água técnica */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0" style={{ opacity: 0.03 }}>
        <div className="text-[80px] font-black tracking-[10px] -rotate-45 whitespace-nowrap uppercase">{t.preview.confidential}</div>
      </div>

      <div className="relative z-10 flex-1">
        {showHeader && <PreviewHeader reportData={reportData} t={t} />}
        <div className={showHeader ? "mt-8" : ""}>
          {children}
        </div>
      </div>

      {/* Footer Rodapé Fixo */}
      <div className="absolute bottom-0 left-0 w-full bg-white z-20">
        <img src={footerImage} alt="Rodapé Intelbras" className="w-full object-bottom" style={{ maxHeight: '60px' }} />
      </div>

      {/* Indicador de Página (Apenas Web) */}
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

  // Lógica de Paginação Dinâmica por Medição de Altura
  useEffect(() => {
    const paginate = () => {
      if (!measurerRef.current) return;

      const items = Array.from(measurerRef.current.children);
      if (items.length === 0) return;

      // CALIBRAÇÃO DE PIXELS:
      // Page N total usable = 1122.5px - 75.6px (Top) - 83.2px (Bottom Padding 2.2cm) = 963.7px.
      // Usamos 950px como limite seguro para a maioria dos navegadores.
      const PAGE_1_MAX_H = 710;
      const PAGE_N_MAX_H = 950;
      
      const newPages = [];
      let currentPageItems = [];
      let pageTop = items[0].getBoundingClientRect().top;

      items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const relativeBottom = rect.bottom - pageTop;
        
        // Define o limite atual dependendo de qual página estamos construindo
        const currentLimit = newPages.length === 0 ? PAGE_1_MAX_H : PAGE_N_MAX_H;

        // REGRA DE PROTEÇÃO DE CABEÇALHO (ÓRFÃOS):
        const isTestHeader = item.getAttribute('data-type') === 'test-header';
        const headerBuffer = isTestHeader ? 180 : 0;

        // REGRA DE INÍCIO DE TESTE (NUNCA NA PÁGINA 1):
        // Se for o início dos resultados e estivermos na folha 1, forçamos a quebra.
        const isTestResultsStart = item.getAttribute('data-type') === 'test-results-header';
        const forcePageBreak = isTestResultsStart && newPages.length === 0 && currentPageItems.length > 0;

        if ((relativeBottom + headerBuffer > currentLimit || forcePageBreak) && currentPageItems.length > 0) {
          // Passou do limite prático ou forçou quebra, este item inaugura uma nova página
          newPages.push(currentPageItems);
          currentPageItems = [index];
          // Novo topo 100% confiável é o topo deste exato elemento
          pageTop = rect.top;
        } else {
          currentPageItems.push(index);
        }
      });

      if (currentPageItems.length > 0) newPages.push(currentPageItems);
      setPages(newPages);
      setMeasuring(false);
    };

    const resizeObserver = new ResizeObserver(() => {
      paginate();
    });

    if (measurerRef.current) {
      resizeObserver.observe(measurerRef.current);
    }

    return () => {
      if (measurerRef.current) resizeObserver.unobserve(measurerRef.current);
      resizeObserver.disconnect();
    };
  }, [reportData, t]);

  // Se os dados mudarem, avisamos que precisamos medir novamente
  useEffect(() => {
    setMeasuring(true);
  }, [reportData]);

  // Renderizador de um "Átomo" de conteúdo (uma seção, um parágrafo ou um bloco de teste)
  const renderAtoms = (isMeasuring = false) => {
    const atoms = [];

    // 1. Introdução
    if (reportData.introduction) {
      atoms.push(<h2 key="intro-h" className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300 atom">{t.preview.introduction}</h2>);
      reportData.introduction.split('\n').filter(p => p.trim()).forEach((p, i) => {
        atoms.push(<p key={`intro-p-${i}`} className="text-[12px] text-justify whitespace-pre-wrap leading-relaxed mb-4 atom">{p}</p>);
      });
    }

    // 2. Objetivos
    if (reportData.objectives) {
      atoms.push(<h2 key="obj-h" className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300 atom">{t.preview.objectives}</h2>);
      reportData.objectives.split('\n').filter(p => p.trim()).forEach((p, i) => {
        atoms.push(<p key={`obj-p-${i}`} className="text-[12px] text-justify whitespace-pre-wrap leading-relaxed mb-4 atom">{p}</p>);
      });
    }

    // 3. Pré-requisitos
    if (reportData.prerequisites) {
      atoms.push(<h2 key="pre-h" className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300 atom">{t.preview.prerequisites}</h2>);
      reportData.prerequisites.split('\n').filter(p => p.trim()).forEach((p, i) => {
        atoms.push(<p key={`pre-p-${i}`} className="text-[12px] text-justify whitespace-pre-wrap leading-relaxed mb-4 atom">{p}</p>);
      });
    }

    // 4. Infraestrutura
    if (reportData.infrastructure && reportData.infrastructure.length > 0) {
      atoms.push(
        <section key="infra" className="mb-8 atom">
          <h2 className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300">{t.preview.infrastructure}</h2>
          <div className="text-[12px] space-y-1">
            {reportData.infrastructure.map((item, i) => (
              <p key={i}>
                <span className="font-bold">[{item.type}]</span> {item.model || 'N/A'}
                {item.type !== 'CLOUD' && item.firmware ? ` - FW: ${item.firmware}` : ''}
              </p>
            ))}
          </div>
        </section>
      );
    }

    // 5. Testes (Inicia sempre na Página 2 ou posterior)
    if (reportData.tests && reportData.tests.length > 0) {
      atoms.push(<h2 key="test-header" className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300 atom" data-type="test-results-header">{t.preview.testResults}</h2>);
      
      reportData.tests.forEach((test, idx) => {
        const testSubAtoms = []; 
        const remainingBlocksAtoms = []; 

        // 5.1 Título do Cenário e Status
        testSubAtoms.push(
          <div key={`test-head-${test.id}`} className="flex justify-between items-end border-b-2 border-slate-900 pb-1 mt-6 mb-4">
            <h4 className="text-[14px] font-black uppercase tracking-tighter">
              {t.testExecution.scenarioLabel} {idx + 1}: {test.scenario || '...'}
            </h4>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
              test.status === 'Pass' ? 'text-green-700 border-green-200 bg-green-50' : 'text-red-700 border-red-200 bg-red-50'
            }`}>
              {test.status === 'Pass' ? t.testExecution.status.pass : t.testExecution.status.fail}
            </span>
          </div>
        );

        // 5.2 Descrição do Cenário
        if (test.description) {
          testSubAtoms.push(
            <div key={`test-desc-${test.id}`} className="bg-slate-50 p-2 rounded-md border-l-4 border-slate-200 mb-4">
              <p className="text-[11px] text-gray-600 italic leading-relaxed">
                <span className="font-bold text-slate-800 not-italic uppercase text-[9px] mr-2">{t.testExecution.objectiveLabel}:</span> 
                {test.description}
              </p>
            </div>
          );
        }

        // 5.3 Fragmentação de Blocos
        if (test.blocks && test.blocks.length > 0) {
          test.blocks.forEach((block, bidx) => {
            if (block.type === 'step' && block.content) {
              const lines = block.content.split('\n').filter(l => l.trim());
              lines.forEach((line, lidx) => {
                const isLastLine = lidx === lines.length - 1;
                const fragment = (
                  <div key={`test-block-${test.id}-${block.id}-p-${lidx}`} className={`${isLastLine ? 'mb-4' : 'mb-0'} atom`}>
                    <PreviewTestResults 
                      tests={[{ ...test, blocks: [{ 
                        ...block, 
                        content: line, 
                        isFragment: lidx > 0,
                        isFirstChunk: lidx === 0,
                        isLastChunk: isLastLine
                      }] }]} 
                      t={t} 
                      onlyBlocks={true} 
                    />
                  </div>
                );
                if (bidx === 0 && lidx === 0) testSubAtoms.push(fragment);
                else remainingBlocksAtoms.push(fragment);
              });
            } 
            else if (block.type === 'list' && block.items && block.items.length > 0) {
              block.items.forEach((item, iidx) => {
                const isLastItem = iidx === block.items.length - 1;
                const fragment = (
                  <div key={`test-block-${test.id}-${block.id}-item-${iidx}`} className={`${isLastItem ? 'mb-4' : 'mb-0'} atom`}>
                    <PreviewTestResults 
                      tests={[{ ...test, blocks: [{ 
                        ...block, 
                        items: [item], 
                        isFragment: iidx > 0,
                        isFirstChunk: iidx === 0,
                        isLastChunk: isLastItem 
                      }] }]} 
                      t={t} 
                      onlyBlocks={true} 
                    />
                  </div>
                );
                if (bidx === 0 && iidx === 0) testSubAtoms.push(fragment);
                else remainingBlocksAtoms.push(fragment);
              });
            }
            else if (block.type === 'code' && block.content) {
              const lines = block.content.split('\n');
              const CHUNK_SIZE = 8;
              for (let i = 0, idx = 0; i < lines.length; i += CHUNK_SIZE, idx++) {
                const chunk = lines.slice(i, i + CHUNK_SIZE).join('\n');
                const isFirstChunk = i === 0;
                const isLastChunk = (i + CHUNK_SIZE) >= lines.length;
                const fragment = (
                  <div key={`test-block-${test.id}-${block.id}-code-${idx}`} className={`${isLastChunk ? 'mb-4' : 'mb-0'} atom`}>
                    <PreviewTestResults 
                      tests={[{ ...test, blocks: [{ 
                        ...block, 
                        content: chunk, 
                        description: isFirstChunk ? block.description : '',
                        isFragment: !isFirstChunk,
                        isFirstChunk: isFirstChunk,
                        isLastChunk: isLastChunk
                      }] }]} 
                      t={t} 
                      onlyBlocks={true} 
                    />
                  </div>
                );
                if (bidx === 0 && isFirstChunk) testSubAtoms.push(fragment);
                else remainingBlocksAtoms.push(fragment);
              }
            }
            else {
              const fragment = (
                <div key={`test-block-${test.id}-${block.id}`} className="mb-2 atom">
                  <PreviewTestResults tests={[{ ...test, blocks: [block] }]} t={t} onlyBlocks={true} />
                </div>
              );
              if (bidx === 0) testSubAtoms.push(fragment);
              else remainingBlocksAtoms.push(fragment);
            }
          });
        }

        // MONTAGEM FINAL DA ESTRUTURA DO TESTE NO PDF
        if (testSubAtoms.length > 0) {
          atoms.push(
            <div key={`test-header-group-${test.id}`} className="atom" data-type="test-header">
              {testSubAtoms}
            </div>
          );
        }

        remainingBlocksAtoms.forEach(fragment => {
          atoms.push(fragment);
        });

        atoms.push(
          <div key={`test-res-${test.id}`} className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-100 border-dashed mt-4 mb-8 atom">
            <div className="space-y-1">
              <span className="font-bold block text-[9px] text-gray-400 tracking-widest uppercase">{t.preview.expected}</span>
              <p className="text-[11px] text-gray-700 font-medium">{test.expectedResult || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold block text-[9px] text-gray-400 tracking-widest uppercase">{t.preview.actual}</span>
              <p className={`text-[11px] font-medium ${test.status === 'Pass' ? 'text-green-700' : 'text-red-700'}`}>
                {test.actualResult || (test.status === 'Pass' ? 'OK' : 'FAIL')}
              </p>
            </div>
          </div>
        );
      });
    }

    return atoms;
  };

  const allAtoms = renderAtoms();

  return (
    <div ref={ref} className="flex flex-col items-center">
      {/* Container Invisível para Medição (Sincronizado com os limites da Page) */}
      <div 
        ref={measurerRef} 
        className="absolute opacity-0 pointer-events-none w-[210mm] px-[2cm] pt-[2cm] pb-[2.2cm]"
        style={{ zIndex: -100, visibility: 'hidden', height: 'auto' }}
      >
        {allAtoms}
      </div>

      {/* Renderização Real em Páginas */}
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
        // Fallback enquanto mede ou se não houver dados
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
