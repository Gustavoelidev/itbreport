import React from 'react';

const IdentificationForm = ({ reportData, handleInputChange }) => {
  return (
    <section className="space-y-4">
      <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Identificação</h3>
      <div className="space-y-3">
        <input 
          type="text" 
          placeholder="Título do Relatório" 
          value={reportData.title} 
          onChange={e => handleInputChange(e, 'title')} 
          className="w-full border p-2 text-sm outline-none rounded" 
        />
        <input 
          type="text" 
          placeholder="Nome do Analista" 
          value={reportData.qaName} 
          onChange={e => handleInputChange(e, 'qaName')} 
          className="w-full border p-2 text-xs outline-none rounded" 
        />
        <div className="grid grid-cols-2 gap-2">
          <input 
            type="text" 
            placeholder="Cargo" 
            value={reportData.role} 
            onChange={e => handleInputChange(e, 'role')} 
            className="w-full border p-2 text-xs outline-none rounded" 
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={reportData.email} 
            onChange={e => handleInputChange(e, 'email')} 
            className="w-full border p-2 text-xs outline-none rounded" 
          />
        </div>
      </div>
    </section>
  );
};

export default IdentificationForm;
