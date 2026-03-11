import React from 'react';
import { Download, FileDown } from 'lucide-react';
import intelbrasLogo from '../../assets/intelbras-logo.svg';

const Header = ({ onExportDOCX, onExportPDF }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm flex-shrink-0">
      <div className="flex items-center gap-2">
        <img src={intelbrasLogo} alt="Intelbras Logo" className="w-24 h-auto" />
        <span className="font-bold text-gray-700 border-l pl-3 ml-1 border-gray-200">QA Report</span>
      </div>
      <div className="flex gap-3">
        <button 
          onClick={onExportDOCX} 
          className="flex items-center gap-2 text-gray-600 hover:text-[#00a335] px-3 py-2 text-sm font-medium transition-colors border border-gray-200 rounded-md bg-white"
        >
          <FileDown size={18} /> DOCX
        </button>
        <button 
          onClick={onExportPDF} 
          className="flex items-center gap-2 bg-[#00a335] hover:bg-[#008a2d] text-white px-4 py-2 text-sm font-bold transition-all rounded-md shadow-sm"
        >
          <Download size={18} /> Exportar PDF
        </button>
      </div>
    </header>
  );
};

export default Header;
