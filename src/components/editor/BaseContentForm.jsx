import React from 'react';

const BaseContentForm = ({ reportData, handleInputChange }) => {
  return (
    <section className="space-y-4">
      <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Conteúdo Base</h3>
      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-bold text-gray-400">INTRODUÇÃO</label>
          <textarea 
            value={reportData.introduction} 
            onChange={e => handleInputChange(e, 'introduction')} 
            className="w-full border rounded p-2 text-xs h-16 outline-none" 
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400">OBJETIVO</label>
          <textarea 
            value={reportData.objectives} 
            onChange={e => handleInputChange(e, 'objectives')} 
            className="w-full border rounded p-2 text-xs h-16 outline-none" 
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400">AMBIENTE / PRÉ-REQUISITOS</label>
          <textarea 
            value={reportData.prerequisites} 
            onChange={e => handleInputChange(e, 'prerequisites')} 
            className="w-full border rounded p-2 text-xs h-16 outline-none" 
          />
        </div>
      </div>
    </section>
  );
};

export default BaseContentForm;
