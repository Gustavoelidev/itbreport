import React, { useState } from 'react';
import { Eraser, Image as ImageIcon, X, Maximize2, Minimize2, MoveHorizontal, Network } from 'lucide-react';
import TopologyModal from './TopologyModal';

const BaseContentForm = ({ reportData, handleInputChange, handleCustomLabelChange, handleBaseImageUpload, removeBaseImage, resizeBaseImage, onClearData, t }) => {
  const [isTopologyModalOpen, setIsTopologyModalOpen] = useState(false);

  const renderField = (fieldId, defaultLabel, isTopology = false) => {
    const isPublic = reportData.isPublic;
    const value = reportData[fieldId] || '';
    const images = reportData[`${fieldId}Images`] || [];
    const customLabel = reportData.customLabels?.[fieldId] ?? '';

    return (
      <div className="space-y-2 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
        <div className="flex items-center justify-between">
          {isPublic ? (
            <input 
              type="text"
              placeholder={defaultLabel}
              value={customLabel}
              onChange={(e) => handleCustomLabelChange(e, fieldId)}
              className="w-full text-[10px] font-black text-gray-500 uppercase tracking-tighter outline-none border-b border-transparent focus:border-indigo-300 placeholder:text-gray-300 bg-transparent"
            />
          ) : (
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{defaultLabel}</label>
          )}

          {isTopology && (
            <button 
              onClick={() => setIsTopologyModalOpen(true)}
              className="flex items-center gap-1.5 px-2 py-1 bg-[#00a335] text-white rounded text-[9px] font-bold uppercase tracking-widest hover:bg-[#008a2d] transition-colors"
            >
              <Network size={12} /> Designer
            </button>
          )}
        </div>
        
        <textarea 
          value={value} 
          onChange={e => handleInputChange(e, fieldId)} 
          className="w-full text-xs p-2 border rounded border-gray-100 h-24 outline-none focus:border-[#00a335]" 
        />

        {/* Upload de Imagens Base */}
        <div 
          className="space-y-3 outline-none focus:ring-1 focus:ring-slate-200 rounded-md"
          tabIndex={0}
          title="Você pode clicar aqui e usar Ctrl+V para colar uma imagem"
          onPaste={(e) => {
            const files = Array.from(e.clipboardData?.files || []);
            if (files.length > 0) {
              files.forEach(file => {
                if (file.type.startsWith('image/')) {
                  handleBaseImageUpload(fieldId, file);
                }
              });
            }
          }}
        >
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {images.map((img) => (
                <div key={img.id} className="relative group/img overflow-hidden rounded-md border border-slate-200">
                  <img src={img.url} className="w-full h-24 object-cover" alt="Preview"/>
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col justify-between p-1">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-1">
                        <button onClick={() => resizeBaseImage(fieldId, img.id, '25%')} className={`p-1 rounded ${img.size === '25%' ? 'bg-[#00a335] text-white' : 'bg-black/50 text-white hover:bg-black/80'}`} title="Pequena">
                          <Minimize2 size={10} />
                        </button>
                        <button onClick={() => resizeBaseImage(fieldId, img.id, '50%')} className={`p-1 rounded ${img.size === '50%' ? 'bg-[#00a335] text-white' : 'bg-black/50 text-white hover:bg-black/80'}`} title="Média">
                          <MoveHorizontal size={10} />
                        </button>
                        <button onClick={() => resizeBaseImage(fieldId, img.id, '100%')} className={`p-1 rounded ${img.size === '100%' ? 'bg-[#00a335] text-white' : 'bg-black/50 text-white hover:bg-black/80'}`} title="Grande">
                          <Maximize2 size={10} />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeBaseImage(fieldId, img.id)}
                        className="bg-red-500 text-white p-1 rounded-full shadow-lg"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <label className="flex flex-col items-center justify-center w-full h-12 border border-dashed border-gray-300 rounded bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors cursor-pointer group/add">
            <div className="flex items-center gap-2">
              <ImageIcon size={14} className="text-gray-400 group-hover/add:text-gray-600" />
              <span className="text-[10px] font-bold text-gray-400 group-hover/add:text-gray-600 uppercase tracking-widest">
                Adicionar Imagem
              </span>
            </div>
            <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => {
              const files = Array.from(e.target.files);
              files.forEach(f => handleBaseImageUpload(fieldId, f));
            }} />
          </label>
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-4">
      {renderField('introduction', t.baseContent.introduction)}
      {renderField('objectives', t.baseContent.objectives)}
      {renderField('topology', t.preview?.topology || 'Topologia', true)}
      {renderField('prerequisites', t.baseContent.prerequisites)}
      {renderField('conclusion', t.baseContent.conclusion)}

      <div className="pt-2">
        <button 
          onClick={onClearData}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-red-200 text-red-500 text-[10px] font-black uppercase tracking-widest rounded hover:bg-red-500 hover:text-white transition-all active:scale-[0.98]"
        >
          <Eraser size={14} /> Limpar Dados do Relatório
        </button>
      </div>

      <TopologyModal 
        isOpen={isTopologyModalOpen} 
        onClose={() => setIsTopologyModalOpen(false)} 
        onSaveImage={({ file }) => handleBaseImageUpload('topology', file)}
      />
    </section>
  );
};

export default BaseContentForm;
