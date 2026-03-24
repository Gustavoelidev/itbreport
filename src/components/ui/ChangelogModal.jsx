import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';

const ChangelogModal = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  const versions = [
    {
      version: "1.0.1",
      date: "Março 2026",
      changes: [
        "Correção de bugs menores.",
        "Melhorias de layout na sidebar e responsividade (Mobile First).",
        "Cenários de teste agora são retráteis.",
        "Aprimoramento na exportação de PDF (removida marca de confidencialidade duplicada)."
      ]
    },
    {
      version: "1.0.0",
      date: "Lançamento Inicial",
      changes: [
        "Lançamento inicial do Intelbras QA Report.",
        "Estrutura base de relatórios com exportação para PDF e DOCX."
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center bg-gray-50 border-b border-gray-100 px-5 py-3">
          <h2 className="font-bold text-gray-700 uppercase tracking-widest text-xs">Changelog (Histórico de Versões)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50">
            <X size={16} />
          </button>
        </div>
        
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
          {versions.map((ver, idx) => (
            <div key={idx} className="relative pl-4 border-l-2 border-[#00a335]/30">
              <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-[#00a335] ring-4 ring-green-50"></div>
              <div className="flex items-baseline gap-2 mb-2 -mt-1.5">
                <h3 className="text-sm font-black text-gray-800">v{ver.version}</h3>
                <span className="text-[10px] text-gray-400 font-medium">{ver.date}</span>
              </div>
              <ul className="space-y-1.5">
                {ver.changes.map((change, cIdx) => (
                  <li key={cIdx} className="flex gap-2 text-[11px] text-gray-600 leading-relaxed">
                    <CheckCircle2 size={12} className="text-[#00a335] shrink-0 mt-[2px]" />
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 text-[11px] font-bold bg-[#00a335] text-white rounded hover:bg-[#008a2d] transition-colors shadow-sm">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangelogModal;
