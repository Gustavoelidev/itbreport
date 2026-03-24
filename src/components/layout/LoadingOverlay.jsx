import React from 'react';

const LoadingOverlay = ({ message = "Exportando Arquivos Profissionais" }) => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="flex flex-col items-center gap-4 px-6 md:px-0">
        <div className="w-12 h-12 border-4 border-[#00a335] border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-[#00a335] animate-pulse uppercase text-[10px] tracking-[0.2em] text-center max-w-xs">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
