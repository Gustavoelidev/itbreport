import React from 'react';
import intelbrasLogo from '../../assets/intelbras-logo.svg';

const PreviewHeader = ({ reportData, t }) => {
  return (
    <>
      {/* Header Logo */}
      <div className="flex justify-end mb-8 relative z-10">
        <img src={intelbrasLogo} alt="Intelbras" className="h-8 object-contain" />
      </div>

      {/* Título e Info QA */}
      <header className="mb-10 relative z-10">
        <h1 className="text-lg font-bold uppercase tracking-tight border-b-2 border-black pb-2 mb-4">
          {reportData.title || (t ? `[${t.identification.title.toUpperCase()}]` : '[TÍTULO DO RELATÓRIO]')}
        </h1>
        
        <div className="text-right text-[12px] space-y-0.5">
          <p className="font-bold text-[14px]">{reportData.qaName || (t ? t.identification.qaName.toUpperCase() : 'NOME DO ANALISTA')}</p>
          <p>{reportData.role || (t ? t.identification.role : 'Cargo')}</p>
          <p className="text-[#00a335] font-medium text-[10px]">{reportData.email}</p>
          <p className="text-gray-400 font-bold pt-4 uppercase text-[9px] tracking-widest inline-block">{reportData.date}</p>
        </div>
      </header>
    </>
  );
};

export default PreviewHeader;
