import React from 'react';
import { Download, FileDown, Menu, X } from 'lucide-react';
import intelbrasLogo from '../../assets/intelbras-logo.svg';

const Header = ({ onExportDOCX, onExportPDF, toggleSidebar, sidebarOpen, lang, setLang, t }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm flex-shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-500"
          title={sidebarOpen ? t.header.collapseEditor : t.header.expandEditor}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center gap-2">
          <img src={intelbrasLogo} alt="Intelbras Logo" className="w-24 h-auto" />
          <span className="font-bold text-gray-700 border-l pl-3 ml-1 border-gray-200 uppercase text-sm tracking-tighter">
            {t.appTitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Language Toggle Flags */}
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-full border border-gray-100">
          <button 
            onClick={() => setLang('pt')}
            className={`w-8 h-8 rounded-full overflow-hidden transition-all duration-300 border-2 ${lang === 'pt' ? 'border-[#00a335] scale-110 shadow-md' : 'border-transparent opacity-40 hover:opacity-100'}`}
            title="Português"
          >
            <img src="https://flagcdn.com/w80/br.png" alt="PT" className="w-full h-full object-cover" />
          </button>
          <button 
            onClick={() => setLang('en')}
            className={`w-8 h-8 rounded-full overflow-hidden transition-all duration-300 border-2 ${lang === 'en' ? 'border-[#00a335] scale-110 shadow-md' : 'border-transparent opacity-40 hover:opacity-100'}`}
            title="English"
          >
            <img src="https://flagcdn.com/w80/us.png" alt="EN" className="w-full h-full object-cover" />
          </button>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onExportDOCX}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <Download size={18} /> {t.header.exportDocx}
          </button>
          <button 
            onClick={onExportPDF}
            className="flex items-center gap-2 px-6 py-2 bg-[#00a335] text-white rounded-md hover:bg-[#008a2d] font-bold text-sm shadow-sm transition-all hover:shadow-md"
          >
            <FileDown size={18} /> {t.header.exportPdf}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
