import React, { forwardRef } from 'react';
import PreviewHeader from './PreviewHeader';
import PreviewTestResults from './PreviewTestResults';
import footerImage from '../../assets/Screenshot_13.png';

// Componente de Página Única (A4)
const Page = ({ children, t, showHeader = false, reportData }) => {
  const calibriStack = '"Calibri", "Candara", "Segoe UI", "Optima", "Arial", sans-serif';
  
  return (
    <div
      className="pdf-page bg-white w-[210mm] min-h-[297mm] shadow-2xl px-[2cm] pt-[2.5cm] pb-[4.5cm] flex flex-col relative overflow-hidden text-black mb-12 group"
      style={{ fontFamily: calibriStack, lineHeight: '1.4' }}
    >
      {/* Marca d'água Profissional (Centralizada em todas as páginas) */}
      <div className="pdf-watermark-html absolute inset-0 flex items-center justify-center pointer-events-none z-0" style={{ opacity: 0.03 }}>
        <div className="text-[100px] font-black tracking-[15px] -rotate-45 whitespace-nowrap uppercase select-none">
          {t.preview.confidential}
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {showHeader && <PreviewHeader reportData={reportData} t={t} />}
        {children}
      </div>

      {/* Footer Rodapé Fixo */}
      <div className="absolute bottom-0 left-0 w-full bg-white z-20">
        <img src={footerImage} alt="Rodapé Intelbras" className="w-full object-bottom" style={{ maxHeight: '60px' }} />
      </div>
      
      {/* Indicador de Página (Visual apenas na web) */}
      <div className="absolute top-4 right-8 text-[10px] text-gray-300 font-mono group-hover:text-gray-400 border border-gray-100 px-2 py-1 rounded">
        A4 PAGE
      </div>
    </div>
  );
};

const DocumentPreview = forwardRef(({ reportData, t }, ref) => {
  
  return (
    <div ref={ref} className="flex flex-col items-center">
      
      {/* PÁGINA 1: Identificação e Contexto */}
      <Page t={t} showHeader={true} reportData={reportData}>
        <div className="space-y-10 mt-6">
          <section>
            <h2 className="text-[13px] font-bold uppercase mb-2 border-b-2 border-[#00a335] inline-block pr-6">{t.preview.introduction}</h2>
            <p className="text-[12.5px] text-justify whitespace-pre-wrap leading-relaxed text-gray-700 font-light">
                {reportData.introduction}
            </p>
          </section>

          <section>
            <h2 className="text-[13px] font-bold uppercase mb-2 border-b-2 border-[#00a335] inline-block pr-6">{t.preview.objectives}</h2>
            <p className="text-[12.5px] text-justify whitespace-pre-wrap leading-relaxed text-gray-700 font-light">
                {reportData.objectives}
            </p>
          </section>
        </div>
      </Page>

      {/* PÁGINA 2: Infraestrutura e Pré-requisitos */}
      <Page t={t}>
        <div className="space-y-10">
          <section>
            <h2 className="text-[13px] font-bold uppercase mb-4 border-b-2 border-[#00a335] inline-block pr-6">{t.preview.infrastructure}</h2>
            <div className="grid grid-cols-1 gap-1.5">
              {reportData.infrastructure.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-100">
                  <span className="text-[10px] font-black bg-gray-200 px-2 py-0.5 rounded text-gray-500 min-w-[50px] text-center">
                    {item.type}
                  </span>
                  <div className="flex-1">
                    <p className="text-[12px] font-bold text-gray-800">{item.model || 'N/A'}</p>
                    {item.type !== 'CLOUD' && item.firmware && (
                      <p className="text-[10px] text-gray-400 tracking-tight">Firmware: {item.firmware}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[13px] font-bold uppercase mb-2 border-b-2 border-[#00a335] inline-block pr-6">{t.preview.prerequisites}</h2>
            <p className="text-[12.5px] text-justify whitespace-pre-wrap leading-relaxed text-gray-700 font-light bg-slate-50 p-4 rounded-lg italic">
                {reportData.prerequisites}
            </p>
          </section>
        </div>
      </Page>

      {/* PÁGINAS DE EXECUÇÃO: Um cenário por página (ou agrupados se forem pequenos) */}
      {/* Para garantir que o usuário veja a paginação, vamos separar cada teste em sua própria página ou blocos lógicos */}
      <Page t={t}>
         <h2 className="text-[16px] font-black uppercase mb-8 text-center text-slate-800 tracking-[5px] border-y py-4 border-slate-100">
            {t.preview.testResults}
         </h2>
         <PreviewTestResults tests={reportData.tests.slice(0, 1)} t={t} />
      </Page>

      {reportData.tests.length > 1 && reportData.tests.slice(1).map((test, idx) => (
        <Page key={test.id} t={t}>
           <PreviewTestResults tests={[test]} t={t} />
        </Page>
      ))}

    </div>
  );
});

export default DocumentPreview;
