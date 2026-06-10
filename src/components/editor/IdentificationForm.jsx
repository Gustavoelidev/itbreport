import React from 'react';
import { CalendarDays } from 'lucide-react';

const IdentificationForm = ({ reportData, handleInputChange, t, lang = 'pt' }) => {
  const formatToday = (lang) => {
    const monthsPT = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    const monthsEN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const d = new Date();
    return lang === 'en'
      ? `${monthsEN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
      : `${d.getDate()} de ${monthsPT[d.getMonth()]} de ${d.getFullYear()}`;
  };

  return (
    <section className="space-y-4">
      <div className="space-y-3 pt-2">
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
            className={`w-full text-xs p-2 border rounded outline-none transition-opacity ${reportData.isPublic ? 'opacity-50 grayscale bg-slate-50 pointer-events-none' : ''}`}
          />
          <input
            placeholder={t.identification.role}
            value={reportData.role}
            onChange={e => handleInputChange(e, 'role')}
            className={`w-full text-xs p-2 border rounded outline-none transition-opacity ${reportData.isPublic ? 'opacity-50 grayscale bg-slate-50 pointer-events-none' : ''}`}
          />
          <input
            placeholder={t.identification.department}
            value={reportData.department}
            onChange={e => handleInputChange(e, 'department')}
            className={`w-full text-xs p-2 border rounded outline-none transition-opacity ${reportData.isPublic ? 'opacity-50 grayscale bg-slate-50 pointer-events-none' : ''}`}
          />
          <input
            placeholder={t.identification.email}
            value={reportData.email}
            onChange={e => handleInputChange(e, 'email')}
            className={`w-full text-xs p-2 border rounded outline-none transition-opacity ${reportData.isPublic ? 'opacity-50 grayscale bg-slate-50 pointer-events-none' : ''}`}
          />

          {/* Campo de Data editável */}
          <div className={`flex items-center gap-1 border rounded overflow-hidden transition-opacity ${reportData.isPublic ? 'opacity-50 grayscale bg-slate-50 pointer-events-none' : ''}`}>
            <input
              type="text"
              placeholder="Data do relatório"
              value={reportData.date || ''}
              onChange={e => handleInputChange(e, 'date')}
              className="flex-1 text-xs p-2 outline-none bg-transparent"
            />
            <button
              onClick={() => handleInputChange({ target: { value: formatToday(lang) } }, 'date')}
              className="px-2 text-gray-400 hover:text-[#00a335] transition-colors"
              title="Usar data de hoje"
            >
              <CalendarDays size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IdentificationForm;
