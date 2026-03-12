import React, { useState, useRef, useEffect } from 'react';
import { Download, FileDown, Menu, X, Languages, LayoutTemplate, ChevronDown } from 'lucide-react';
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
  const [showTemplates, setShowTemplates] = useState(false);
  const dropdownRef = useRef(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTemplates(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm flex-shrink-0 h-16">
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
          <span className="font-bold text-gray-700 border-l pl-3 ml-1 border-gray-200 uppercase text-xs tracking-tighter">
            {t.appTitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Custom Template Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 hover:border-[#00a335] hover:bg-gray-50 transition-all group"
          >
            <LayoutTemplate size={16} className="text-gray-400 group-hover:text-[#00a335]" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">{t.templates.title}</span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${showTemplates ? 'rotate-180' : ''}`} />
          </button>

          {showTemplates && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-100 rounded-lg shadow-xl z-[100] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 pb-2 mb-2 border-b border-gray-50">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.templates.select}</span>
              </div>
              {templates.map(temp => (
                <button
                  key={temp.id}
                  onClick={() => {
                    onApplyTemplate(temp.id);
                    setShowTemplates(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 transition-colors group/item"
                >
                  <div className="text-[11px] font-bold text-gray-700 group-hover/item:text-[#00a335] uppercase tracking-tight">{temp.name}</div>
                  <div className="text-[10px] text-gray-400 line-clamp-1">{temp.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-[1px] bg-gray-100 mx-1"></div>

        {/* Auto Translation Button */}
        <button 
          onClick={onAutoTranslate}
          disabled={isTranslating}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${isTranslating ? 'bg-gray-50 opacity-50' : 'hover:bg-slate-50'}`}
          title={t.translations.autoTranslate}
        >
          <Languages size={18} className={isTranslating ? 'animate-pulse text-[#00a335]' : 'text-gray-400 group-hover:text-[#00a335]'} />
          <span className="text-[10px] font-black text-gray-500 group-hover:text-[#00a335] uppercase tracking-widest">
            {isTranslating ? t.translations.translating : t.translations.autoTranslate}
          </span>
        </button>

        {/* Language Toggle Flags */}
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-full border border-gray-100">
          <button 
            onClick={() => setLang('pt')}
            className={`w-7 h-7 rounded-full overflow-hidden transition-all duration-300 border-2 ${lang === 'pt' ? 'border-[#00a335] scale-105 shadow-sm' : 'border-transparent opacity-40 hover:opacity-100'}`}
            title="Português"
          >
            <img src="https://flagcdn.com/w80/br.png" alt="PT" className="w-full h-full object-cover" />
          </button>
          <button 
            onClick={() => setLang('en')}
            className={`w-7 h-7 rounded-full overflow-hidden transition-all duration-300 border-2 ${lang === 'en' ? 'border-[#00a335] scale-105 shadow-sm' : 'border-transparent opacity-40 hover:opacity-100'}`}
            title="English"
          >
            <img src="https://flagcdn.com/w80/us.png" alt="EN" className="w-full h-full object-cover" />
          </button>
        </div>

        <div className="flex gap-2 ml-2">
          <button 
            onClick={onExportDOCX}
            className="flex items-center gap-2 px-3 py-2 text-[11px] font-black text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 rounded-md hover:bg-gray-50 uppercase tracking-widest"
          >
            <Download size={14} /> DOCX
          </button>
          <button 
            onClick={onExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-[#00a335] text-white rounded-md hover:bg-[#008a2d] font-black text-[11px] shadow-sm transition-all hover:shadow-md uppercase tracking-widest"
          >
            <FileDown size={14} /> PDF
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
