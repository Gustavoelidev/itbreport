import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const InfrastructureForm = ({ reportData, handleInfraChange, addInfraItem, removeInfraItem }) => {
  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Infraestrutura</h3>
        <button onClick={addInfraItem} className="text-[#00a335] p-1"><Plus size={16}/></button>
      </div>
      {reportData.infrastructure.map((item) => (
        <div key={item.id} className="p-3 border rounded-md bg-gray-50 space-y-2">
          <div className="flex gap-2 items-center">
            <select 
              className="flex-1 text-xs font-bold p-1 bg-white border rounded outline-none focus:border-[#00a335]"
              value={item.type}
              onChange={e => handleInfraChange(item.id, 'type', e.target.value)}
            >
              <option value="AP">Access Point (AP)</option>
              <option value="WC">Wireless Controller (WC)</option>
              <option value="CLOUD">Cloud Management</option>
            </select>
            <button 
              onClick={() => removeInfraItem(item.id)} 
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              title="Remover item"
            >
              <Trash2 size={14}/>
            </button>
          </div>
          <div className="space-y-2">

            <input 
              placeholder="Modelo" 
              value={item.model} 
              onChange={e => handleInfraChange(item.id, 'model', e.target.value)} 
              className="w-full p-1 text-xs border rounded" 
            />
            {item.type !== 'CLOUD' && (
              <input 
                placeholder="Firmware" 
                value={item.firmware} 
                onChange={e => handleInfraChange(item.id, 'firmware', e.target.value)} 
                className="w-full p-1 text-xs border rounded" 
              />
            )}
          </div>
        </div>
      ))}
    </section>
  );
};

export default InfrastructureForm;
