import React from 'react';
import { Plus, Trash2, Code, X } from 'lucide-react';

const TestExecutionForm = ({ 
  reportData, 
  handleTestChange, 
  addTestCase, 
  removeTestCase, 
  handleImageUpload, 
  removeEvidence, 
  updateEvidenceDescription,
  addCodeBlock,
  removeCodeBlock,
  handleCodeBlockChange
}) => {
  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Execução de Testes</h3>
        <button onClick={addTestCase} className="bg-[#00a335] text-white p-1 rounded-md"><Plus size={16}/></button>
      </div>
      {reportData.tests.map((test, index) => (
        <div key={test.id} className="p-4 border rounded-md space-y-3 bg-white shadow-sm">
          <div className="flex justify-between">
            <span className="text-[10px] font-bold text-gray-400">TESTE #{index + 1}</span>
            <button onClick={() => removeTestCase(test.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
          </div>
          <input 
            placeholder="Título do Cenário" 
            value={test.scenario} 
            onChange={e => handleTestChange(test.id, 'scenario', e.target.value)} 
            className="w-full font-bold text-xs border-b outline-none focus:border-[#00a335]" 
          />
          <select 
            className="text-xs p-1 rounded border outline-none font-bold" 
            value={test.status} 
            onChange={e => handleTestChange(test.id, 'status', e.target.value)}
          >
            <option value="Pass">PASS</option>
            <option value="Fail">FAIL</option>
          </select>
          <textarea 
            placeholder="Passos executados" 
            value={test.steps} 
            onChange={e => handleTestChange(test.id, 'steps', e.target.value)} 
            className="w-full text-xs p-2 border rounded h-16 outline-none" 
          />
          
          <div className="space-y-4 pt-2 border-t mt-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider">
                <Code size={10}/> Blocos de Código / Terminal
              </label>
              <button 
                onClick={() => addCodeBlock(test.id)} 
                className="bg-slate-100 p-1 rounded-md hover:bg-slate-200 transition-colors"
                title="Adicionar Bloco de Código"
              >
                <Plus size={14} className="text-slate-600" />
              </button>
            </div>

            {test.codeBlocks && test.codeBlocks.length > 0 ? (
              <div className="space-y-3">
                {test.codeBlocks.map((block) => (
                  <div key={block.id} className="p-3 border rounded-md bg-slate-50 space-y-2 relative group">
                    <button 
                      onClick={() => removeCodeBlock(test.id, block.id)}
                      className="absolute top-1 right-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                    <input 
                      placeholder="Descrição do bloco (ex: Configuração da Interface)" 
                      value={block.description}
                      onChange={e => handleCodeBlockChange(test.id, block.id, 'description', e.target.value)}
                      className="w-full text-[10px] p-1 border rounded outline-none bg-white font-medium" 
                    />
                    <textarea 
                      placeholder="Cole comandos ou scripts aqui..." 
                      value={block.content} 
                      onChange={e => handleCodeBlockChange(test.id, block.id, 'content', e.target.value)} 
                      className="w-full text-[10px] p-2 border rounded h-24 outline-none font-mono bg-gray-900 text-green-400" 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-gray-400 italic text-center py-2">Nenhum bloco de código adicionado.</p>
            )}
          </div>

          <textarea 
            placeholder="Resultado esperado..." 
            value={test.expectedResult} 
            onChange={e => handleTestChange(test.id, 'expectedResult', e.target.value)} 
            className="w-full text-xs p-2 border rounded h-16 outline-none" 
          />
          <textarea 
            placeholder="Observações do resultado obtido..." 
            value={test.actualResult} 
            onChange={e => handleTestChange(test.id, 'actualResult', e.target.value)} 
            className="w-full text-xs p-2 border rounded h-16 outline-none" 
          />
          
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-t pt-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Evidências Técnicas</label>
              <label className="cursor-pointer bg-slate-100 p-1.5 rounded-md hover:bg-slate-200 transition-colors">
                <Plus size={14} className="text-slate-600" />
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(test.id, e)} />
              </label>
            </div>
            
            {test.evidences.length > 0 && (
              <div className="space-y-3">
                {test.evidences.map((ev) => (
                  <div key={ev.id} className="p-2 border rounded bg-slate-50 relative group">
                    <button 
                      onClick={() => removeEvidence(test.id, ev.id)}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                    <div className="flex gap-2">
                      <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden border">
                        <img src={ev.url} className="w-full h-full object-cover" alt="Thumb" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Legenda da evidência..." 
                        value={ev.description}
                        onChange={(e) => updateEvidenceDescription(test.id, ev.id, e.target.value)}
                        className="flex-1 text-[10px] bg-white border p-1 rounded outline-none h-fit self-center"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </section>
  );
};

export default TestExecutionForm;
