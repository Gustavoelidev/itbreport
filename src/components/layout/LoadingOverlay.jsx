import React from 'react';

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#00a335] border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-[#00a335] animate-pulse uppercase text-[10px] tracking-widest text-center">
          Exportando Arquivos Profissionais
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
