import React from 'react';
import intelbrasLogo from '../../assets/intelbras-logo.svg';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-[#00a335] flex items-center justify-center z-[9999]">
      <div className="animate-pulse">
        <img 
          src={intelbrasLogo} 
          alt="Intelbras Logo" 
          className="w-48 md:w-64 h-auto brightness-0 invert" 
        />
      </div>
    </div>
  );
};

export default SplashScreen;
