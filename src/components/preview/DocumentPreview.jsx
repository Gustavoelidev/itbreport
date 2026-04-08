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

        if (shouldBreak && currentPageItems.length > 0) {
          newPages.push(currentPageItems);
          currentPageItems = [index];
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

  /**
   * Traduz o estado estruturado do relatório em átomos de DOM mensuráveis.
   */
  const renderAtoms = (isMeasuring = false) => {
    const atoms = [];
    let sectionCounter = 1;

    if (reportData.introduction) {
      atoms.push(<h2 key="intro-h" className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300 atom">{sectionCounter++}. {t.preview.introduction}</h2>);
      reportData.introduction.split('\n').filter(p => p.trim()).forEach((p, i) => {
        atoms.push(<p key={`intro-p-${i}`} className="text-[12px] text-justify whitespace-pre-wrap leading-relaxed mb-4 atom">{p}</p>);
      });
    }

    if (reportData.objectives) {
      atoms.push(<h2 key="obj-h" className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300 atom">{sectionCounter++}. {t.preview.objectives}</h2>);
      reportData.objectives.split('\n').filter(p => p.trim()).forEach((p, i) => {
        atoms.push(<p key={`obj-p-${i}`} className="text-[12px] text-justify whitespace-pre-wrap leading-relaxed mb-4 atom">{p}</p>);
      });
    }

    if (reportData.prerequisites) {
      atoms.push(<h2 key="pre-h" className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300 atom">{sectionCounter++}. {t.preview.prerequisites}</h2>);
      reportData.prerequisites.split('\n').filter(p => p.trim()).forEach((p, i) => {
        atoms.push(<p key={`pre-p-${i}`} className="text-[12px] text-justify whitespace-pre-wrap leading-relaxed mb-4 atom">{p}</p>);
      });
    }

    const activeInfra = reportData.infrastructure?.filter(item => item.type !== 'NONE') || [];
    if (activeInfra.length > 0) {
      atoms.push(
        <section key="infra" className="mb-8 atom">
          <h2 className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300">{sectionCounter++}. {t.preview.infrastructure}</h2>
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

    const hasTopology = reportData.topology?.edges?.length > 0 || Object.keys(reportData.topology?.nodes || {}).length > 0;
    const activeInfraNodes = reportData.infrastructure.filter(i => i.type !== 'NONE');

    if (hasTopology && activeInfraNodes.length > 0) {
      atoms.push(
        <section key="topology" className="mb-8 atom">
          <h2 className="text-[12px] font-bold uppercase mb-4 border-b border-gray-300">{sectionCounter++}. {t.sidebar.topology}</h2>
          <div className="w-full h-[280px] bg-white border border-slate-100 rounded-xl relative overflow-hidden shadow-sm">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 280" preserveAspectRatio="xMidYMid meet">
              {/* Edges */}
              {reportData.topology.edges.map(edge => {
                const from = reportData.topology.nodes[edge.from];
                const to = reportData.topology.nodes[edge.to];
                if (!from || !to) return null;
                const scaledYFrom = (from.y * 280) / 400;
                const scaledYTo = (to.y * 280) / 400;
                return (
                  <line 
                    key={edge.id}
                    x1={from.x} y1={scaledYFrom} 
                    x2={to.x} y2={scaledYTo} 
                    stroke="#CBD5E1" 
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                );
              })}
              {/* Nodes */}
              {activeInfraNodes.map(infra => {
                const node = reportData.topology.nodes[infra.id];
                if (!node) return null;
                const scaledY = (node.y * 280) / 400;

                return (
                  <g key={infra.id} transform={`translate(${node.x}, ${scaledY})`}>
                    <rect x="-18" y="-18" width="36" height="36" rx="8" fill="white" stroke="#00a335" strokeWidth="1.5" />
                    
                    {/* Icon Symbols */}
                    {infra.type === 'AP' && (
                       <g transform="translate(-10, -10) scale(0.8)" fill="none" stroke="#00a335" strokeWidth="2" strokeLinecap="round">
                          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                          <circle cx="12" cy="20" r="2" fill="#00a335" />
                       </g>
                    )}
                    {(infra.type === 'SWITCH' || infra.type === 'NONE') && (
                       <g transform="translate(-10, -10) scale(0.8)" fill="none" stroke="#00a335" strokeWidth="2" strokeLinecap="round">
                          <rect x="2" y="2" width="20" height="20" rx="2" />
                          <path d="M7 8h10M7 12h10M7 16h10" />
                       </g>
                    )}
                    {infra.type === 'ROUTER' && (
                       <g transform="translate(-10, -10) scale(0.8)" fill="none" stroke="#00a335" strokeWidth="2" strokeLinecap="round">
                          <rect x="2" y="14" width="20" height="8" rx="2" />
                          <path d="M6 14v-4M18 14v-4M12 14v-8" />
                       </g>
                    )}
                    {infra.type === 'CLOUD' && (
                       <g transform="translate(-10, -10) scale(0.8)" fill="none" stroke="#00a335" strokeWidth="2" strokeLinecap="round">
                          <path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2-1.5-3.5-3.5-4C18 7.5 15.5 5 12.5 5c-2.5 0-4.5 1.5-5 4-2.5.5-4.5 2.5-4.5 5 0 2.5 2 4.5 4.5 4.5" />
                       </g>
                    )}
                    {infra.type === 'STATION' && (
                       <g transform="translate(-10, -10) scale(0.8)" fill="none" stroke="#00a335" strokeWidth="2" strokeLinecap="round">
                          <rect x="2" y="3" width="20" height="14" rx="2" />
                          <path d="M8 21h8M12 17v4" />
                       </g>
                    )}
                    {infra.type === 'MOBILE' && (
                       <g transform="translate(-10, -10) scale(0.8)" fill="none" stroke="#00a335" strokeWidth="2" strokeLinecap="round">
                          <rect x="5" y="2" width="14" height="20" rx="2" />
                          <path d="M12 18h.01" />
                       </g>
                    )}

                    <text 
                      y="32" 
                      textAnchor="middle" 
                      fontSize="7" 
                      className="fill-slate-600 font-bold uppercase tracking-tight"
                    >
                      {infra.model || infra.type}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </section>
      );
    }

    if (reportData.tests && reportData.tests.length > 0) {
      atoms.push(
        <h2 
          key="test-header" 
          data-force-break="true" 
          className="text-[12px] font-bold uppercase mb-6 border-b border-gray-300 atom"
        >
          {sectionCounter++}. {t.preview.testResults}
        </h2>
      );
      
      reportData.tests.forEach((test, idx) => {
        atoms.push(
          <div 
            key={`test-head-${test.id}`} 
            data-force-break={idx > 0 ? "true" : "false"}
            className="flex justify-between items-end border-b-2 border-slate-900 pb-1 mt-8 mb-6 atom"
          >
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

        if (test.description) {
          atoms.push(
            <div key={`test-desc-${test.id}`} className="bg-slate-50 p-3 rounded-md border-l-4 border-slate-200 mb-6 atom">
              <p className="text-[11px] text-gray-600 italic leading-relaxed whitespace-pre-wrap">
                <span className="font-bold text-slate-800 not-italic uppercase text-[9px] mr-2">{t.testExecution.objectiveLabel}:</span> 
                {test.description}
              </p>
            </div>
          );
        }

        if (test.blocks && test.blocks.length > 0) {
          test.blocks.forEach((block, bidx) => {
            atoms.push(
              <div key={`test-block-${test.id}-${block.id}`} className="mb-6 atom">
                <PreviewTestResults tests={[{ ...test, blocks: [block] }]} t={t} onlyBlocks={true} />
              </div>
            );
          });
        }

        atoms.push(
          <div key={`test-res-${test.id}`} className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100 border-dashed mt-8 mb-12 atom">
            <div className="space-y-1">
              <span className="font-bold block text-[9px] text-gray-400 tracking-widest uppercase">{t.preview.expected}</span>
              <p className="text-[11px] text-gray-700 font-medium whitespace-pre-wrap">{test.expectedResult || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold block text-[9px] text-gray-400 tracking-widest uppercase">{t.preview.actual}</span>
              <p className={`text-[11px] font-medium whitespace-pre-wrap ${test.status === 'Pass' ? 'text-green-700' : 'text-red-700'}`}>
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
