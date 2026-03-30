import React from 'react';
import { Eraser } from 'lucide-react';

const BaseContentForm = ({ reportData, handleInputChange, onClearData, t }) => {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{t.baseContent.introduction}</label>
        <textarea 
          value={reportData.introduction} 
          onChange={e => handleInputChange(e, 'introduction')} 
          className="w-full text-xs p-2 border rounded border-gray-100 h-24 outline-none focus:border-[#00a335]" 
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{t.baseContent.objectives}</label>
        <textarea 
          value={reportData.objectives} 
          onChange={e => handleInputChange(e, 'objectives')} 
          className="w-full text-xs p-2 border rounded border-gray-100 h-24 outline-none focus:border-[#00a335]" 
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{t.baseContent.prerequisites}</label>
        <textarea 
          value={reportData.prerequisites} 
          onChange={e => handleInputChange(e, 'prerequisites')} 
          className="w-full text-xs p-2 border rounded border-gray-100 h-24 outline-none focus:border-[#00a335]" 
        />
      </div>

      <div className="pt-2">
        <button 
          onClick={onClearData}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-red-200 text-red-500 text-[10px] font-black uppercase tracking-widest rounded hover:bg-red-500 hover:text-white transition-all active:scale-[0.98]"
        >
          <Eraser size={14} /> Limpar Dados do Relatório
        </button>
      </div>
    </section>
  );
};

export default BaseContentForm;
