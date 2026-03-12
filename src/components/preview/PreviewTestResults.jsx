import React from 'react';

const PreviewTestResults = ({ tests, t }) => {
  const monoStack = '"Consolas", "Monaco", "Courier New", monospace';

  const renderRichText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={i} className="font-bold">{part.slice(2, -2)}</span>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-8 pt-4">
      {tests.map((test, index) => (
        <div key={test.id} className="space-y-6 pb-8">
          {/* Header do Cenário */}
          <div className="flex justify-between items-end border-b-2 border-slate-900 pb-1">
            <h4 className="text-[14px] font-black uppercase tracking-tighter">
              {t.testExecution.scenarioLabel} {index + 1}: {test.scenario || '...'}
            </h4>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
              test.status === 'Pass' 
                ? 'text-green-700 border-green-200 bg-green-50' 
                : 'text-red-700 border-red-200 bg-red-50'
            }`}>
              {test.status === 'Pass' ? t.testExecution.status.pass : t.testExecution.status.fail}
            </span>
          </div>
          
          <div className="space-y-6 text-[11px]">
            {/* Descrição Geral */}
            {test.description && (
              <div className="bg-slate-50 p-3 rounded-md border-l-4 border-slate-200">
                <p className="text-gray-600 italic leading-relaxed">
                  <span className="font-bold text-slate-800 not-italic uppercase text-[9px] mr-2">{t.testExecution.objectiveLabel}:</span> 
                  {renderRichText(test.description)}
                </p>
              </div>
            )}

            {/* RENDERIZAÇÃO DOS BLOCOS */}
            <div className="space-y-6">
              {test.blocks && test.blocks.map((block) => (
                <div key={block.id} className="break-inside-avoid">
                  {/* Tópico */}
                  {block.type === 'subtopic' && block.content && (
                    <div className="mt-6 mb-2">
                       <h5 className="text-[11px] font-bold text-slate-800 uppercase border-b border-slate-100 pb-1 tracking-wide">
                        {renderRichText(block.content)}
                      </h5>
                    </div>
                  )}

                  {/* Passo */}
                  {block.type === 'step' && block.content && (
                    <p className="whitespace-pre-wrap text-gray-700 leading-relaxed pl-1">
                      {renderRichText(block.content)}
                    </p>
                  )}

                  {/* Lista */}
                  {block.type === 'list' && block.items && block.items.length > 0 && (
                    <div className="pl-4">
                      {block.listType === 'number' ? (
                        <ol className="list-decimal space-y-1.5 list-outside text-gray-700 pl-1 leading-relaxed">
                          {block.items.filter(i => i.text.trim()).map((item) => (
                            <li key={item.id}>
                              {renderRichText(item.text)}
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <ul className="list-disc space-y-1.5 list-outside text-gray-700 pl-1 leading-relaxed">
                          {block.items.filter(i => i.text.trim()).map((item) => (
                            <li key={item.id}>
                              {renderRichText(item.text)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Terminal */}
                  {block.type === 'code' && block.content && (
                    <div className="mt-2 space-y-1.5">
                      {block.description && (
                        <p className="text-[9px] font-bold text-gray-400 uppercase ml-1">
                          ↳ {renderRichText(block.description)}
                        </p>
                      )}
                      <div className="bg-gray-100 p-4 rounded-sm border border-gray-200 overflow-x-auto">
                        <pre className="text-[10px] whitespace-pre-wrap m-0 leading-tight" style={{ fontFamily: monoStack }}>
                          {block.content}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Imagem */}
                  {block.type === 'image' && block.content && (
                    <div className="mt-4 space-y-2 flex flex-col items-center">
                      <div className="border border-slate-200 p-1.5 bg-white shadow-sm inline-block max-w-full">
                        <img src={block.content} alt="Evidência" className="max-h-[450px] object-contain mx-auto" />
                      </div>
                      {block.description && (
                        <p className="text-[10px] italic text-gray-500 text-center max-w-[80%] leading-tight">
                          {t.preview.fig} {renderRichText(block.description)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Rodapé de Resultados */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100 border-dashed mt-8">
              <div className="space-y-1">
                <span className="font-bold block text-[9px] text-gray-400 tracking-widest uppercase">{t.preview.expected}</span>
                <p className="text-gray-700 font-medium">{renderRichText(test.expectedResult) || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold block text-[9px] text-gray-400 tracking-widest uppercase">{t.preview.actual}</span>
                <p className={`font-medium ${test.status === 'Pass' ? 'text-green-700' : 'text-red-700'}`}>
                  {renderRichText(test.actualResult) || (test.status === 'Pass' ? 'OK' : 'FAIL')}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PreviewTestResults;
