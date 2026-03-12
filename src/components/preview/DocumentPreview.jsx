import React, { forwardRef } from 'react';
import PreviewHeader from './PreviewHeader';
import PreviewTestResults from './PreviewTestResults';
import footerImage from '../../assets/Screenshot_13.png';

// Componente de Página Única (A4) - Mantendo a estrutura técnica e limpa
const Page = ({ children, t, showHeader = false, reportData }) => {
  const calibriStack = '"Calibri", "Candara", "Segoe UI", "Optima", "Arial", sans-serif';
  
  return (
    <div
      className="pdf-page bg-white w-[210mm] min-h-[297mm] shadow-2xl px-[2cm] pt-[2cm] pb-[4cm] flex flex-col relative overflow-hidden text-black mb-12"
      style={{ fontFamily: calibriStack, lineHeight: '1.4' }}
    >
      {/* Marca d'água técnica sutil */}
      <div className="pdf-watermark-html absolute inset-0 flex items-center justify-center pointer-events-none z-0" style={{ opacity: 0.03 }}>
        <div className="text-[80px] font-black tracking-[10px] -rotate-45 whitespace-nowrap uppercase select-none">
          {t.preview.confidential}
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {showHeader && <PreviewHeader reportData={reportData} t={t} />}
        <div className={showHeader ? "mt-10" : ""}>
            {children}
        </div>
      </div>

      {/* Footer Rodapé Fixo na base da folha */}
      <div className="absolute bottom-0 left-0 w-full bg-white z-20">
        <img src={footerImage} alt="Rodapé Intelbras" className="w-full object-bottom" style={{ maxHeight: '60px' }} />
      </div>
    </div>
  );
};

const DocumentPreview = forwardRef(({ reportData, t }, ref) => {
  return (
    <div ref={ref} className="flex flex-col items-center">
      
      {/* PÁGINA 1: Introdução e Objetivos */}
      <Page t={t} showHeader={true} reportData={reportData}>
        <div className="space-y-10">
          <section>
            <h2 className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300">{t.preview.introduction}</h2>
            <p className="text-[12px] text-justify whitespace-pre-wrap">{reportData.introduction}</p>
          </section>

          <section>
            <h2 className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300">{t.preview.objectives}</h2>
            <p className="text-[12px] text-justify whitespace-pre-wrap">{reportData.objectives}</p>
          </section>
        </div>
      </Page>

      {/* PÁGINA 2: Infraestrutura e Pré-requisitos */}
      <Page t={t}>
        <div className="space-y-10">
          <section>
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

          <section>
            <h2 className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300">{t.preview.prerequisites}</h2>
            <p className="text-[12px] text-justify whitespace-pre-wrap leading-snug">{reportData.prerequisites}</p>
          </section>
        </div>
      </Page>

      {/* RESULTADOS DE TESTES - Distribuídos em novas páginas */}
      {/* Colocamos o título de Resultados e o primeiro cenário */}
      <Page t={t}>
         <h2 className="text-[12px] font-bold uppercase mb-6 border-b border-gray-300">{t.preview.testResults}</h2>
         <PreviewTestResults tests={reportData.tests.slice(0, 1)} t={t} />
      </Page>

      {/* Cenários subsequentes, cada um em sua página para evitar cortes */}
      {reportData.tests.length > 1 && reportData.tests.slice(1).map((test) => (
        <Page key={test.id} t={t}>
           <PreviewTestResults tests={[test]} t={t} />
        </Page>
      ))}

    </div>
  );
});

export default DocumentPreview;
