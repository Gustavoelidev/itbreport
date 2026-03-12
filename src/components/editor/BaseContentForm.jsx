import React from 'react';

const BaseContentForm = ({ reportData, handleInputChange, t }) => {
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
    </section>
  );
};

export default BaseContentForm;
