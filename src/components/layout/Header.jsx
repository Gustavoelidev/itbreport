import React from 'react';
import { Download, FileDown, Menu, X, Languages, LayoutTemplate } from 'lucide-react';
import intelbrasLogo from '../../assets/intelbras-logo.svg';
import { templates } from '../../constants/templates';

const Header = ({ 
  onExportDOCX, 
  onExportPDF, 
  toggleSidebar, 
  sidebarOpen, 
  lang, 
  setLang, 
  t,
  onApplyTemplate,
  onAutoTranslate,
  isTranslating
}) => {
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
        {/* Templates Selector */}
        <div className="flex items-center gap-2 border-r pr-6 border-gray-100">
           <div className="flex flex-col items-end mr-1">
             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">{t.templates.title}</span>
             <select 
               className="text-[11px] font-bold text-gray-600 bg-transparent outline-none cursor-pointer hover:text-[#00a335]"
               onChange={(e) => onApplyTemplate(e.target.value)}
               defaultValue=""
             >
               <option value="" disabled>{t.templates.select}</option>
               {templates.map(temp => (
                 <option key={temp.id} value={temp.id}>{temp.name}</option>
               ))}
             </select>
           </div>
           <LayoutTemplate size={18} className="text-gray-300" />
        </div>

        {/* Auto Translation Button */}
        <button 
          onClick={onAutoTranslate}
          disabled={isTranslating}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-100 transition-all ${isTranslating ? 'bg-gray-50 opacity-50' : 'hover:bg-slate-50 hover:border-[#00a335]'}`}
          title={t.translations.autoTranslate}
        >
          <Languages size={18} className={isTranslating ? 'animate-pulse text-[#00a335]' : 'text-gray-400 group-hover:text-[#00a335]'} />
          <span className="text-xs font-bold text-gray-500 group-hover:text-gray-700">
            {isTranslating ? t.translations.translating : t.translations.autoTranslate}
          </span>
        </button>

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

        <div className="flex gap-2">
          <button 
            onClick={onExportDOCX}
            className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <Download size={18} /> DOCX
          </button>
          <button 
            onClick={onExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-[#00a335] text-white rounded-md hover:bg-[#008a2d] font-bold text-sm shadow-sm transition-all hover:shadow-md"
          >
            <FileDown size={18} /> PDF
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
