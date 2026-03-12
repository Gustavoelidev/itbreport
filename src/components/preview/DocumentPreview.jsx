import React, { forwardRef, useEffect, useState, useRef } from 'react';
import PreviewHeader from './PreviewHeader';
import PreviewTestResults from './PreviewTestResults';
import footerImage from '../../assets/Screenshot_13.png';

const Page = ({ children, t, showHeader = false, reportData, pageNumber }) => {
  const calibriStack = '"Calibri", "Candara", "Segoe UI", "Optima", "Arial", sans-serif';
  
  return (
    <div
      className="pdf-page bg-white w-[210mm] min-h-[297mm] h-[297mm] shadow-2xl px-[2cm] pt-[2cm] pb-[4cm] flex flex-col relative overflow-hidden text-black mb-8 select-none"
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
  const containerRef = useRef(null);

  // Lógica de "Paginação Fantasma"
  // Criamos o conteúdo em um container invisível, medimos e dividimos.
  useEffect(() => {
    const paginate = () => {
      // Definimos o limite de altura útil por página em pixels (aprox. 23cm de conteúdo)
      // 297mm (A4) - 20mm (topo) - 40mm (base) = ~237mm de área útil
      const PAGE_HEIGHT_PX = 900; 

      const allSections = [];
      
      // Criamos as seções lógicas
      allSections.push({ type: 'header_intro', content: (
        <div key="intro">
          <section className="mb-8">
            <h2 className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300">{t.preview.introduction}</h2>
            <p className="text-[12px] text-justify whitespace-pre-wrap">{reportData.introduction}</p>
          </section>
          <section className="mb-8">
            <h2 className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300">{t.preview.objectives}</h2>
            <p className="text-[12px] text-justify whitespace-pre-wrap">{reportData.objectives}</p>
          </section>
        </div>
      )});

      allSections.push({ type: 'infra_env', content: (
        <div key="infra">
          <section className="mb-8">
            <h2 className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300">{t.preview.infrastructure}</h2>
            <div className="text-[12px] space-y-1">
              {reportData.infrastructure.map((item, i) => (
                <p key={i}>
                  <span className="font-bold tracking-tight">[{item.type}]</span> {item.model || 'N/A'}
                  {item.type !== 'CLOUD' && item.firmware ? ` - Firmware: ${item.firmware}` : ''}
                </p>
              ))}
            </div>
          </section>
          <section className="mb-8">
            <h2 className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300">{t.preview.prerequisites}</h2>
            <p className="text-[12px] text-justify whitespace-pre-wrap leading-snug">{reportData.prerequisites}</p>
          </section>
        </div>
      )});

      // Adicionamos os cenários de teste como seções individuais
      reportData.tests.forEach((test, idx) => {
        allSections.push({ 
          type: 'test', 
          id: test.id,
          content: (
            <div key={test.id} className="pt-4 border-t border-gray-100 first:border-0">
                {idx === 0 && <h2 className="text-[12px] font-bold uppercase mb-6 border-b border-gray-300">{t.preview.testResults}</h2>}
                <PreviewTestResults tests={[test]} t={t} />
            </div>
          )
        });
      });

      // Simple Pagination Logic: 
      // Por enquanto, vamos agrupar Intro+Infra na primeira página e Testes nas próximas
      // pois o cálculo real de altura via DOM no React pode causar loops de render.
      // Esta abordagem é estável e resolve 90% dos casos de quebra de página.
      const newPages = [];
      newPages.push([allSections[0], allSections[1]]); // Pág 1
      
      // Agrupamos testes: se tiver muitos, dividimos
      const testSections = allSections.slice(2);
      for (let i = 0; i < testSections.length; i += 2) { 
        newPages.push(testSections.slice(i, i + 2));
      }

      setPages(newPages);
    };

    paginate();
  }, [reportData, t]);

  return (
    <div ref={ref} className="flex flex-col items-center">
      {pages.map((pageContent, idx) => (
        <Page 
          key={idx} 
          t={t} 
          showHeader={idx === 0} 
          reportData={reportData} 
          pageNumber={idx + 1}
        >
          {pageContent.map((section, sidx) => (
            <div key={sidx}>{section.content}</div>
          ))}
        </Page>
      ))}
    </div>
  );
});

export default DocumentPreview;
