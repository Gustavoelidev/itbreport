import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const InfrastructureForm = ({ reportData, handleInfraChange, addInfraItem, removeInfraItem, t }) => {
  return (
    <section className="space-y-4">
      <div className="flex justify-end">
        <button 
          onClick={addInfraItem} 
          className="bg-[#00a335] hover:bg-[#008a2d] text-white px-3 py-1.5 rounded-md flex items-center gap-2 text-[10px] font-bold transition-all shadow-sm"
        >
          <Plus size={14}/> {t.infrastructure.addInfra.toUpperCase()}
        </button>
      </div>

      <div className="space-y-3">
        {reportData.infrastructure.map((infra) => (
          <div key={infra.id} className="p-3 border rounded-lg bg-gray-50/50 space-y-3 relative group transition-all hover:bg-white hover:shadow-md">
            <button 
              onClick={() => removeInfraItem(infra.id)} 
              className="absolute -right-2 -top-2 bg-white text-red-400 hover:text-red-600 p-1 rounded-full shadow-sm border opacity-0 group-hover:opacity-100 transition-all scale-75 hover:scale-100"
            >
              <Trash2 size={14}/>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter px-1">{t.infrastructure.type}</label>
                <select 
                  className="w-full text-xs p-1.5 border rounded-md bg-white outline-none focus:border-[#00a335]"
                  value={infra.type} 
                  onChange={e => handleInfraChange(infra.id, 'type', e.target.value)}
                >
                  <option value="AP">AP</option>
                  <option value="SWITCH">Switch</option>
                  <option value="ROUTER">Router</option>
                  <option value="CLOUD">Cloud / Server</option>
                  <option value="STATION">Station / Client</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter px-1">{t.infrastructure.model}</label>
                <input 
                  placeholder="Ex: RG-RAP6262" 
                  value={infra.model} 
                  onChange={e => handleInfraChange(infra.id, 'model', e.target.value)} 
                  className="w-full text-xs p-1.5 border rounded-md outline-none focus:border-[#00a335]" 
                />
              </div>
            </div>

            {infra.type !== 'CLOUD' && (
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter px-1">{t.infrastructure.firmware}</label>
                <input 
                  placeholder="Ex: 3.0.1.r1234" 
                  value={infra.firmware} 
                  onChange={e => handleInfraChange(infra.id, 'firmware', e.target.value)} 
                  className="w-full text-xs p-1.5 border rounded-md outline-none focus:border-[#00a335]" 
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default InfrastructureForm;
