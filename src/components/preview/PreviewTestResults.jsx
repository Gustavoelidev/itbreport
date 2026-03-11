import React from 'react';

const PreviewTestResults = ({ tests }) => {
  const monoStack = '"Consolas", "Monaco", "Courier New", monospace';

  return (
    <div className="space-y-12">
      {tests.map((test, index) => (
        <div key={test.id} className="space-y-4 pb-6">
          <div className="flex justify-between items-baseline">
            <h4 className="text-[12px] font-bold uppercase tracking-tight">CENÁRIO {index + 1}: {test.scenario || 'Teste sem título'}</h4>
            <span className={`text-[10px] font-bold ${test.status === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
              [STATUS: {test.status.toUpperCase()}]
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-3 text-[11px]">
            <div>
              <p><span className="font-bold">Descrição:</span> {test.description}</p>
            </div>
            <div>
              <p className="font-bold mb-1 underline">Passos:</p>
              <p className="whitespace-pre-wrap text-gray-700">{test.steps}</p>
            </div>
            
            {test.codeBlocks && test.codeBlocks.length > 0 && (
              <div className="mt-4 space-y-4">
                {test.codeBlocks.map((block) => (
                  <div key={block.id} className="space-y-1">
                    {block.description && (
                      <p className="font-bold text-[9px] text-gray-400 uppercase tracking-tight pl-1 border-l-2 border-slate-200">
                        {block.description}
                      </p>
                    )}
                    <div className="bg-gray-100 p-3 rounded-sm border border-gray-200 overflow-x-auto relative">
                      <pre className="text-[10px] whitespace-pre-wrap m-0 leading-relaxed" style={{ fontFamily: monoStack }}>
                        {block.content}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-6 mt-2">
              <p><span className="font-bold block text-[9px] text-gray-400 uppercase">Esperado</span> {test.expectedResult}</p>
              <p><span className="font-bold block text-[9px] text-gray-400 uppercase">Obtido</span> {test.actualResult || 'Conforme esperado.'}</p>
            </div>
          </div>

          {/* Renderização de múltiplas evidências com legenda */}
          {test.evidences && test.evidences.length > 0 && (
            <div className="mt-6 space-y-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b pb-1">Evidências Técnicas</p>
              {test.evidences.map((ev) => (
                <div key={ev.id} className="space-y-2">
                  <div className="inline-block border border-gray-100 p-1 bg-white shadow-sm max-w-[90%]">
                    <img src={ev.url} alt="Evidência" className="max-w-[100%] max-h-[350px] object-contain" />
                  </div>
                  {ev.description && (
                    <p className="text-[10px] italic text-gray-500 pl-2 border-l-2 border-gray-200">
                      {ev.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PreviewTestResults;
