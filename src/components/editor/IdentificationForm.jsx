import React from 'react';

const IdentificationForm = ({ reportData, handleInputChange, t }) => {
  return (
    <section className="space-y-4">

      <div className="space-y-3">
        <input
          type="text"
          placeholder={t.identification.title}
          value={reportData.title}
          onChange={e => handleInputChange(e, 'title')}
          className="w-full font-bold text-sm border-b outline-none focus:border-[#00a335]"
        />
        <div className="grid grid-cols-1 gap-3">
          <input
            placeholder={t.identification.qaName}
            value={reportData.qaName}
            onChange={e => handleInputChange(e, 'qaName')}
            className="w-full text-xs p-2 border rounded outline-none"
          />
          <input
            placeholder={t.identification.role}
            value={reportData.role}
            onChange={e => handleInputChange(e, 'role')}
            className="w-full text-xs p-2 border rounded outline-none"
          />
          <input
            placeholder={t.identification.department}
            value={reportData.department}
            onChange={e => handleInputChange(e, 'department')}
            className="w-full text-xs p-2 border rounded outline-none"
          />
          <input
            placeholder={t.identification.email}
            value={reportData.email}
            onChange={e => handleInputChange(e, 'email')}
            className="w-full text-xs p-2 border rounded outline-none"
          />
        </div>
      </div>
    </section>
  );
};

export default IdentificationForm;
