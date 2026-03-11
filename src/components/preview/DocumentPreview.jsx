import React, { forwardRef } from 'react';
import PreviewHeader from './PreviewHeader';
import PreviewTestResults from './PreviewTestResults';
import footerImage from '../../assets/Screenshot_13.png';

const DocumentPreview = forwardRef(({ reportData }, ref) => {
  const calibriStack = '"Calibri", "Candara", "Segoe UI", "Optima", "Arial", sans-serif';

  return (
    <div
      ref={ref}
      className="bg-white w-[210mm] min-h-[297mm] shadow-2xl px-[2cm] pt-[2cm] pb-[4cm] flex flex-col relative overflow-hidden text-black mb-12"
      style={{ fontFamily: calibriStack, lineHeight: '1.4' }}
    >
      {/* Marca d'água */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0" style={{ opacity: 0.03 }}>
        <div className="text-[120px] font-black tracking-[30px] -rotate-45 whitespace-nowrap">CONFIDENCIAL</div>
      </div>

      <PreviewHeader reportData={reportData} />

      {/* Conteúdo Técnico */}
      <div className="flex-1 space-y-10 relative z-10 mt-10">
        <section>
          <h2 className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300">1. INTRODUÇÃO</h2>
          <p className="text-[12px] text-justify whitespace-pre-wrap">{reportData.introduction}</p>
        </section>

        <section>
          <h2 className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300">2. OBJETIVO</h2>
          <p className="text-[12px] text-justify whitespace-pre-wrap">{reportData.objectives}</p>
        </section>

        <section>
          <h2 className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300">3. INFRAESTRUTURA</h2>
          <div className="text-[12px] space-y-1">
            {reportData.infrastructure.map((item, i) => (
              <p key={i}>
                <span className="font-bold tracking-tight">[{item.type}]</span> {item.model || 'Não especificado'}
                {item.type !== 'CLOUD' && item.firmware ? ` - Firmware: ${item.firmware}` : ''}
              </p>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[12px] font-bold uppercase mb-2 border-b border-gray-300">4. CONFIGURAÇÕES DE AMBIENTE (PRÉ-REQUISITOS)</h2>
          <p className="text-[12px] text-justify whitespace-pre-wrap leading-snug">{reportData.prerequisites}</p>
        </section>

        <section>
          <h2 className="text-[12px] font-bold uppercase mb-6 border-b border-gray-300">5. RESULTADOS DE TESTES</h2>
          <PreviewTestResults tests={reportData.tests} />
        </section>
      </div>

      {/* Footer Rodapé */}
      <div className="absolute bottom-0 left-0 w-full bg-white">
        <img src={footerImage} alt="Rodapé Intelbras" className="w-full object-bottom" style={{ maxHeight: '60px' }} />
      </div>
    </div>
  );
});

export default DocumentPreview;
