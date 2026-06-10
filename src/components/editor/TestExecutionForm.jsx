import React from 'react';
import { Plus, Trash2, Code, X, Image as ImageIcon, Type, Layout, List, ChevronUp, ChevronDown, ListOrdered, ChevronRight, Copy, Smartphone, SeparatorHorizontal, Heading2, GripVertical, Network } from 'lucide-react';
import TopologyModal from './TopologyModal';

const TestExecutionForm = ({ 
  reportData, 
  handleTestChange, 
  addTestCase, 
  removeTestCase,
  duplicateTestCase,
  moveTestCase,
  addBlock,
  removeBlock,
  handleBlockChange,
  handleBlockImageUpload,
  addListItem,
  removeListItem,
  handleListItemChange,
  moveBlock,
  handleGridImageUpload,
  removeGridImage,
  t
}) => {
  const [collapsedTests, setCollapsedTests] = React.useState({});
  const [draggedBlock, setDraggedBlock] = React.useState(null); // { testId, blockId }
  const [dragOverBlockId, setDragOverBlockId] = React.useState(null);
  const [draggableBlockId, setDraggableBlockId] = React.useState(null);
  const [activeTopologyBlockId, setActiveTopologyBlockId] = React.useState(null);

  const handleDragStart = (e, testId, blockId) => {
    setDraggedBlock({ testId, blockId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, blockId) => {
    e.preventDefault();
    if (draggedBlock && draggedBlock.blockId !== blockId) {
      setDragOverBlockId(blockId);
    }
  };

  const handleDragLeave = () => {
    setDragOverBlockId(null);
  };

  const handleDrop = (e, targetTestId, targetBlockId) => {
    e.preventDefault();
    if (!draggedBlock) return;
    
    const { testId: sourceTestId, blockId: sourceBlockId } = draggedBlock;
    
    // Reorder blocks within the same test case
    if (sourceTestId === targetTestId && sourceBlockId !== targetBlockId) {
      const currentTest = reportData.tests.find(t => t.id === targetTestId);
      if (currentTest && currentTest.blocks) {
        const newBlocks = [...currentTest.blocks];
        const sourceIndex = newBlocks.findIndex(b => b.id === sourceBlockId);
        const targetIndex = newBlocks.findIndex(b => b.id === targetBlockId);
        
        if (sourceIndex !== -1 && targetIndex !== -1) {
          const [removed] = newBlocks.splice(sourceIndex, 1);
          newBlocks.splice(targetIndex, 0, removed);
          handleTestChange(targetTestId, 'blocks', newBlocks);
        }
      }
    }
    
    setDraggedBlock(null);
    setDragOverBlockId(null);
    setDraggableBlockId(null);
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
    setDragOverBlockId(null);
    setDraggableBlockId(null);
  };

  const toggleCollapse = (id) => {
    setCollapsedTests(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-end items-center mb-2">
        <button 
          onClick={addTestCase} 
          className="bg-[#00a335] hover:bg-[#008a2d] text-white px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-bold transition-all shadow-sm"
        >
          <Plus size={14}/> {t.testExecution.newScenario}
        </button>
      </div>

      {reportData.tests.map((test, index) => {
        const isCollapsed = collapsedTests[test.id];
        
        return (
          <div key={test.id} className="p-4 border rounded-lg space-y-4 bg-white shadow-md border-gray-100 relative group">
            <div className="flex justify-between items-center bg-gray-50 -mx-4 -mt-4 p-3 rounded-t-lg border-b mb-2">
              <div 
                className="flex items-center gap-2 cursor-pointer flex-1"
                onClick={() => toggleCollapse(test.id)}
              >
                {isCollapsed ? <ChevronRight size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                <span className="text-[10px] font-black text-gray-400 tracking-tighter uppercase">{t.testExecution.scenarioLabel} #{index + 1}</span>
                {isCollapsed && test.scenario && (
                  <span className="text-[10px] font-bold text-gray-700 truncate max-w-[150px] ml-2">
                    - {test.scenario}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => moveTestCase(test.id, 'up')} 
                  disabled={index === 0}
                  className="text-gray-300 hover:text-gray-500 disabled:opacity-30 disabled:hover:text-gray-300 transition-colors"
                  title="Mover para cima"
                >
                  <ChevronUp size={16}/>
                </button>
                <button 
                  onClick={() => moveTestCase(test.id, 'down')} 
                  disabled={index === reportData.tests.length - 1}
                  className="text-gray-300 hover:text-gray-500 disabled:opacity-30 disabled:hover:text-gray-300 transition-colors mr-2"
                  title="Mover para baixo"
                >
                  <ChevronDown size={16}/>
                </button>
                <button 
                  onClick={() => duplicateTestCase(test.id)} 
                  className="text-gray-300 hover:text-blue-500 transition-colors mr-1"
                  title="Clonar Cenário"
                >
                  <Copy size={16}/>
                </button>
                <button 
                  onClick={() => removeTestCase(test.id)} 
                  className="text-gray-300 hover:text-red-500 transition-colors"
                  title="Remover Cenário"
                >
                  <Trash2 size={16}/>
                </button>
              </div>
            </div>

            {!isCollapsed && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="space-y-3">
                  <input 
                    placeholder={t.testExecution.scenarioTitle} 
                    value={test.scenario} 
                    onChange={e => handleTestChange(test.id, 'scenario', e.target.value)} 
                    className="w-full font-bold text-sm border-b pb-1 outline-none focus:border-[#00a335] placeholder:text-gray-300" 
                  />
                  
                  <div className="flex items-center gap-3">
                    {!reportData.isPublic && (
                      <select 
                        className={`text-[10px] p-1 px-2 rounded border outline-none font-bold uppercase ${
                          test.status === 'Pass' ? 'text-green-600 border-green-200 bg-green-50' : 'text-red-600 border-red-200 bg-red-50'
                        }`}
                        value={test.status} 
                        onChange={e => handleTestChange(test.id, 'status', e.target.value)}
                      >
                        <option value="Pass">{t.testExecution.status.pass}</option>
                        <option value="Fail">{t.testExecution.status.fail}</option>
                      </select>
                    )}
                    <input 
                      placeholder={t.testExecution.objectiveLabel + "..."} 
                      value={test.description}
                      onChange={e => handleTestChange(test.id, 'description', e.target.value)}
                      className="flex-1 text-[11px] text-gray-500 italic outline-none border-b border-transparent focus:border-gray-100"
                    />
                  </div>
                </div>

                {/* BLOCK TOOLBAR */}
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-lg border border-dashed border-slate-200 justify-center flex-wrap">
                  <button onClick={() => addBlock(test.id, 'subtopic')} className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-indigo-600 hover:bg-indigo-100 rounded transition-colors uppercase">
                    <Layout size={12}/> {t.testExecution.blocks.subtopic}
                  </button>
                  <div className="w-[1px] h-3 bg-slate-200"></div>
                  <button onClick={() => addBlock(test.id, 'subtitle')} className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-violet-600 hover:bg-violet-100 rounded transition-colors uppercase">
                    <Heading2 size={12}/> {t.testExecution.blocks.subtitle}
                  </button>
                  <div className="w-[1px] h-3 bg-slate-200"></div>
                  <button onClick={() => addBlock(test.id, 'step')} className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-emerald-600 hover:bg-emerald-100 rounded transition-colors uppercase">
                    <Type size={12}/> {t.testExecution.blocks.step}
                  </button>
                  <div className="w-[1px] h-3 bg-slate-200"></div>
                  <button onClick={() => addBlock(test.id, 'list')} className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-blue-600 hover:bg-blue-100 rounded transition-colors uppercase">
                    <List size={12}/> {t.testExecution.blocks.list}
                  </button>
                  <div className="w-[1px] h-3 bg-slate-200"></div>
                  <button onClick={() => addBlock(test.id, 'code')} className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-slate-600 hover:bg-slate-200 rounded transition-colors uppercase">
                    <Code size={12}/> {t.testExecution.blocks.code}
                  </button>
                  <div className="w-[1px] h-3 bg-slate-200"></div>
                  <button onClick={() => addBlock(test.id, 'image')} className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-amber-600 hover:bg-amber-100 rounded transition-colors uppercase">
                    <ImageIcon size={12}/> {t.testExecution.blocks.image}
                  </button>
                  <div className="w-[1px] h-3 bg-slate-200"></div>
                  <button onClick={() => addBlock(test.id, 'image_grid')} className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-pink-600 hover:bg-pink-100 rounded transition-colors uppercase">
                    <Smartphone size={12}/> {t.testExecution.blocks.imageGrid}
                  </button>
                  <div className="w-[1px] h-3 bg-slate-200"></div>
                  <button onClick={() => addBlock(test.id, 'spacer')} className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-purple-600 hover:bg-purple-100 rounded transition-colors uppercase">
                    <SeparatorHorizontal size={12}/> {t.testExecution.blocks.spacer}
                  </button>
                  <div className="w-[1px] h-3 bg-slate-200"></div>
                  <button onClick={() => addBlock(test.id, 'topology')} className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-teal-600 hover:bg-teal-100 rounded transition-colors uppercase">
                    <Network size={12}/> Topologia
                  </button>
                </div>
                <div className="text-[9px] text-gray-400 text-center italic">
                  {t.testExecution.blocks.boldTip}
                </div>

                {/* RENDER BLOCKS */}
                <div className="space-y-4 min-h-[50px]">
                  {test.blocks && test.blocks.map((block, bIndex) => (
                    <div 
                      key={block.id} 
                      className={`relative transition-all duration-200 ${draggedBlock?.blockId === block.id ? 'opacity-30 bg-slate-50' : ''} ${dragOverBlockId === block.id ? 'border-t-2 border-indigo-400 pt-1' : ''}`}
                      draggable={draggableBlockId === block.id}
                      onDragStart={(e) => handleDragStart(e, test.id, block.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, block.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, test.id, block.id)}
                    >
                      {/* Linha de Inserção entre Blocos */}
                      {bIndex > 0 && (
                        <div className="absolute -top-[10px] left-0 right-0 h-4 group/insert flex items-center justify-center z-20">
                          <div className="w-full h-[1px] bg-transparent group-hover/insert:bg-slate-200 transition-colors" />
                          <div className="absolute opacity-0 group-hover/insert:opacity-100 transition-all duration-150 bg-white border border-slate-200 rounded-full p-1 shadow-md flex items-center gap-1 scale-75 group-hover/insert:scale-100">
                            <button onClick={() => addBlock(test.id, 'subtopic', test.blocks[bIndex - 1].id)} title={t.testExecution.blocks.subtopic} className="p-1 hover:bg-indigo-50 rounded text-indigo-600 transition-colors">
                              <Layout size={10} />
                            </button>
                            <button onClick={() => addBlock(test.id, 'subtitle', test.blocks[bIndex - 1].id)} title={t.testExecution.blocks.subtitle} className="p-1 hover:bg-violet-50 rounded text-violet-600 transition-colors">
                              <Heading2 size={10} />
                            </button>
                            <button onClick={() => addBlock(test.id, 'step', test.blocks[bIndex - 1].id)} title={t.testExecution.blocks.step} className="p-1 hover:bg-emerald-50 rounded text-emerald-600 transition-colors">
                              <Type size={10} />
                            </button>
                            <button onClick={() => addBlock(test.id, 'list', test.blocks[bIndex - 1].id)} title={t.testExecution.blocks.list} className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors">
                              <List size={10} />
                            </button>
                            <button onClick={() => addBlock(test.id, 'code', test.blocks[bIndex - 1].id)} title={t.testExecution.blocks.code} className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors">
                              <Code size={10} />
                            </button>
                            <button onClick={() => addBlock(test.id, 'image', test.blocks[bIndex - 1].id)} title={t.testExecution.blocks.image} className="p-1 hover:bg-amber-50 rounded text-amber-600 transition-colors">
                              <ImageIcon size={10} />
                            </button>
                            <button onClick={() => addBlock(test.id, 'image_grid', test.blocks[bIndex - 1].id)} title={t.testExecution.blocks.imageGrid} className="p-1 hover:bg-pink-50 rounded text-pink-600 transition-colors">
                              <Smartphone size={10} />
                            </button>
                            <button onClick={() => addBlock(test.id, 'spacer', test.blocks[bIndex - 1].id)} title={t.testExecution.blocks.spacer} className="p-1 hover:bg-purple-50 rounded text-purple-600 transition-colors">
                              <SeparatorHorizontal size={10} />
                            </button>
                            <button onClick={() => addBlock(test.id, 'topology', test.blocks[bIndex - 1].id)} title="Topologia" className="p-1 hover:bg-teal-50 rounded text-teal-600 transition-colors">
                              <Network size={10} />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="relative pl-4 border-l-2 border-slate-100 group/block">
                        <div className="absolute -left-[9px] top-0 flex flex-col items-center bg-white">
                          <div className={`w-4 h-4 rounded-full border-2 border-slate-200 flex items-center justify-center bg-white`}>
                            {block.type === 'subtopic' && <Layout size={8} className="text-indigo-500 fill-indigo-50" />}
                            {block.type === 'subtitle' && <Heading2 size={8} className="text-violet-500 fill-violet-50" />}
                            {block.type === 'step' && <Type size={8} className="text-emerald-500" />}
                            {block.type === 'list' && <List size={8} className="text-blue-500" />}
                            {block.type === 'code' && <Code size={8} className="text-slate-500" />}
                            {block.type === 'image' && <ImageIcon size={8} className="text-amber-500 fill-amber-50" />}
                            {block.type === 'image_grid' && <Smartphone size={8} className="text-pink-500 fill-pink-50" />}
                            {block.type === 'spacer' && <SeparatorHorizontal size={8} className="text-purple-500" />}
                            {block.type === 'topology' && <Network size={8} className="text-teal-500" />}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">
                              {block.type === 'subtopic' ? t.testExecution.blocks.subtopic : block.type === 'subtitle' ? t.testExecution.blocks.subtitle : block.type === 'step' ? t.testExecution.blocks.step : block.type === 'code' ? t.testExecution.blocks.code : block.type === 'list' ? t.testExecution.blocks.list : block.type === 'image_grid' ? t.testExecution.blocks.imageGrid : block.type === 'spacer' ? t.testExecution.blocks.spacer : block.type === 'topology' ? 'Topologia' : t.testExecution.blocks.image}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover/block:opacity-100 transition-opacity">
                              <button 
                                onMouseDown={() => setDraggableBlockId(block.id)}
                                onMouseUp={() => setDraggableBlockId(null)}
                                className="p-0.5 hover:bg-slate-100 rounded text-gray-400 cursor-grab active:cursor-grabbing mr-1"
                                title="Arrastar para reordenar"
                              >
                                <GripVertical size={12}/>
                              </button>
                              <button onClick={() => moveBlock(test.id, block.id, 'up')} className="p-0.5 hover:bg-slate-100 rounded text-gray-400"><ChevronUp size={12}/></button>
                              <button onClick={() => moveBlock(test.id, block.id, 'down')} className="p-0.5 hover:bg-slate-100 rounded text-gray-400"><ChevronDown size={12}/></button>
                              <button onClick={() => removeBlock(test.id, block.id)} className="p-0.5 hover:bg-red-50 rounded text-red-300 hover:text-red-500 ml-1"><X size={12}/></button>
                            </div>
                          </div>

                          {block.type === 'subtopic' && (
                            <input 
                              placeholder={t.testExecution.blocks.placeholderSubtopic} 
                              value={block.content}
                              onChange={e => handleBlockChange(test.id, block.id, 'content', e.target.value)}
                              className="w-full font-bold text-xs p-1.5 border border-gray-100 rounded focus:border-indigo-400 outline-none uppercase tracking-wide bg-slate-50/50"
                            />
                          )}

                          {block.type === 'subtitle' && (
                            <input 
                              placeholder={t.testExecution.blocks.placeholderSubtitle} 
                              value={block.content}
                              onChange={e => handleBlockChange(test.id, block.id, 'content', e.target.value)}
                              className="w-full font-bold text-[11px] p-1.5 border border-gray-100 rounded focus:border-violet-400 outline-none tracking-wide bg-slate-50/50 text-gray-700"
                            />
                          )}

                          {block.type === 'step' && (
                            <textarea 
                              placeholder={t.testExecution.blocks.placeholderStep} 
                              value={block.content}
                              onChange={e => handleBlockChange(test.id, block.id, 'content', e.target.value)}
                              className="w-full text-[11px] p-2 border border-gray-100 rounded focus:border-emerald-400 h-20 outline-none resize-y bg-slate-50/50"
                            />
                          )}

                          {block.type === 'list' && (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleBlockChange(test.id, block.id, 'listType', 'bullet')}
                                  className={`px-2 py-0.5 text-[8px] font-bold rounded ${block.listType === 'bullet' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}
                                >
                                  Marcadores
                                </button>
                                <button 
                                  onClick={() => handleBlockChange(test.id, block.id, 'listType', 'number')}
                                  className={`px-2 py-0.5 text-[8px] font-bold rounded ${block.listType === 'number' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}
                                >
                                  Numeração
                                </button>
                              </div>
                              <div className="space-y-1.5">
                                {block.items && block.items.map((item, idx) => (
                                  <div key={item.id} className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-400 min-w-[12px] text-right font-black">
                                      {block.listType === 'bullet' ? '•' : `${idx + 1}.`}
                                    </span>
                                    <input 
                                      value={item.text}
                                      onChange={(e) => {
                                        const updatedItems = block.items.map(it => it.id === item.id ? { ...it, text: e.target.value } : it);
                                        handleBlockChange(test.id, block.id, 'items', updatedItems);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          const newItem = { id: Date.now(), text: '' };
                                          const updatedItems = [...block.items];
                                          updatedItems.splice(idx + 1, 0, newItem);
                                          handleBlockChange(test.id, block.id, 'items', updatedItems);
                                          
                                          setTimeout(() => {
                                            const inputs = e.target.closest('.space-y-1.5').querySelectorAll('input');
                                            if (inputs[idx + 1]) inputs[idx + 1].focus();
                                          }, 10);
                                        }
                                        if (e.key === 'Backspace' && !item.text && block.items.length > 1) {
                                          e.preventDefault();
                                          const updatedItems = block.items.filter(it => it.id !== item.id);
                                          handleBlockChange(test.id, block.id, 'items', updatedItems);
                                          
                                          setTimeout(() => {
                                            const inputs = e.target.closest('.space-y-1.5').querySelectorAll('input');
                                            const targetIndex = idx === 0 ? 0 : idx - 1;
                                            if (inputs[targetIndex]) {
                                              inputs[targetIndex].focus();
                                              const len = inputs[targetIndex].value.length;
                                              inputs[targetIndex].setSelectionRange(len, len);
                                            }
                                          }, 10);
                                        }
                                      }}
                                      className="flex-1 text-[11px] p-1 border border-gray-100 rounded focus:border-blue-400 outline-none bg-slate-50/50"
                                      placeholder="Item..."
                                    />
                                    <button 
                                      onClick={() => {
                                        if (block.items.length > 1) {
                                          handleBlockChange(test.id, block.id, 'items', block.items.filter(it => it.id !== item.id));
                                        }
                                      }}
                                      className="p-1 hover:bg-red-50 text-red-300 hover:text-red-500 rounded"
                                    >
                                      <X size={10} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {block.type === 'code' && (
                            <div className="space-y-1.5">
                              <input 
                                placeholder={t.testExecution.blocks.placeholderCodeDesc} 
                                value={block.description}
                                onChange={e => handleBlockChange(test.id, block.id, 'description', e.target.value)}
                                className="w-full text-[10px] p-1 border border-gray-100 rounded focus:border-slate-400 outline-none bg-slate-50/50 font-bold uppercase tracking-wide"
                              />
                              <textarea 
                                placeholder={t.testExecution.blocks.placeholderCode} 
                                value={block.content}
                                onChange={e => handleBlockChange(test.id, block.id, 'content', e.target.value)}
                                className="w-full text-[10px] p-2 border border-gray-100 rounded focus:border-slate-400 h-24 outline-none font-mono bg-slate-50/50"
                              />
                            </div>
                          )}

                          {block.type === 'image' && (
                            <div
                              className="space-y-2 outline-none focus:ring-1 focus:ring-amber-200 rounded-md p-1 -m-1"
                              tabIndex={0}
                              title="Você pode clicar aqui e usar Ctrl+V para colar uma imagem"
                              onPaste={(e) => {
                                const files = Array.from(e.clipboardData?.files || []);
                                const img = files.find(f => f.type.startsWith('image/'));
                                if (img) handleBlockImageUpload(test.id, block.id, img);
                              }}
                            >
                              {block.content ? (
                                <div className="relative border rounded p-1 bg-white inline-block max-w-[200px] group/imgblock">
                                  <img src={block.content} className="max-h-24 w-auto object-contain" alt="Evidência"/>
                                  <button
                                    onClick={() => handleBlockChange(test.id, block.id, 'content', '')}
                                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600 shadow-md"
                                  >
                                    <X size={10} />
                                  </button>
                                </div>
                              ) : (
                                <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg py-4 cursor-pointer hover:bg-slate-50 hover:border-amber-400 transition-colors">
                                  <ImageIcon size={20} className="text-slate-400 mb-1" />
                                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Carregar ou Ctrl+V</span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleBlockImageUpload(test.id, block.id, e)}
                                  />
                                </label>
                              )}
                              <input 
                                placeholder={t.testExecution.blocks.placeholderImage} 
                                value={block.description}
                                onChange={e => handleBlockChange(test.id, block.id, 'description', e.target.value)}
                                className="w-full text-[10px] p-1.5 border border-gray-100 rounded focus:border-amber-400 outline-none bg-slate-50/50"
                              />
                            </div>
                          )}

                          {block.type === 'image_grid' && (
                            <div 
                              className="space-y-3 outline-none focus:ring-1 focus:ring-pink-200 rounded-md p-1 -m-1"
                              tabIndex={0}
                              title="Você pode clicar aqui e usar Ctrl+V para adicionar várias imagens"
                              onPaste={(e) => {
                                const files = Array.from(e.clipboardData?.files || []);
                                if (files.length > 0) {
                                  files.forEach(file => {
                                    if (file.type.startsWith('image/')) {
                                      handleGridImageUpload(test.id, block.id, file);
                                    }
                                  });
                                }
                              }}
                            >
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {block.items && block.items.map((img) => (
                                  <div key={img.id} className="relative group/gridimg aspect-[9/16] bg-slate-100 rounded border border-slate-200 overflow-hidden shadow-sm">
                                    <img src={img.content} className="w-full h-full object-cover" alt="Grid item"/>
                                    <button 
                                      onClick={() => removeGridImage(test.id, block.id, img.id)}
                                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover/gridimg:opacity-100 transition-opacity shadow-lg"
                                      title="Remover imagem"
                                    >
                                      <X size={10} />
                                    </button>
                                  </div>
                                ))}
                                
                                <label className="aspect-[9/16] border-2 border-dashed border-pink-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-pink-50 hover:border-pink-300 transition-all group/add">
                                  <Plus size={20} className="text-pink-300 group-hover/add:text-pink-500 transition-colors" />
                                  <span className="text-[8px] font-black text-pink-400 mt-1 uppercase tracking-tighter">Adicionar</span>
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={(e) => handleGridImageUpload(test.id, block.id, e)} 
                                  />
                                </label>
                              </div>
                              <input 
                                placeholder={t.testExecution.blocks.placeholderImage} 
                                value={block.description}
                                onChange={e => handleBlockChange(test.id, block.id, 'description', e.target.value)}
                                className="w-full text-[10px] p-1.5 border border-gray-100 rounded focus:border-pink-400 outline-none bg-slate-50/50"
                              />
                            </div>
                          )}

                          {block.type === 'spacer' && (
                            <div className="space-y-2 p-2 bg-slate-50 rounded border border-gray-100">
                              <div className="flex flex-wrap gap-4 items-center">
                                {/* Tipo de espaçador */}
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-gray-400 font-bold uppercase">Tipo:</span>
                                  <div className="flex rounded border bg-white overflow-hidden">
                                    <button
                                      onClick={() => handleBlockChange(test.id, block.id, 'spacerType', 'vertical')}
                                      className={`px-2 py-1 text-[9px] font-bold ${(!block.spacerType || block.spacerType === 'vertical') ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                                    >
                                      Espaço Vertical
                                    </button>
                                    <button
                                      onClick={() => handleBlockChange(test.id, block.id, 'spacerType', 'page_break')}
                                      className={`px-2 py-1 text-[9px] font-bold ${(block.spacerType === 'page_break') ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                                    >
                                      Quebra de Página
                                    </button>
                                  </div>
                                </div>

                                {/* Altura (se for vertical) */}
                                {(!block.spacerType || block.spacerType === 'vertical') && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Altura:</span>
                                    <div className="flex rounded border bg-white overflow-hidden">
                                      <button
                                        onClick={() => handleBlockChange(test.id, block.id, 'spacerHeight', 'small')}
                                        className={`px-2 py-1 text-[9px] font-bold ${(block.spacerHeight === 'small') ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                                      >
                                        Pequeno (20px)
                                      </button>
                                      <button
                                        onClick={() => handleBlockChange(test.id, block.id, 'spacerHeight', 'medium')}
                                        className={`px-2 py-1 text-[9px] font-bold ${(!block.spacerHeight || block.spacerHeight === 'medium') ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                                      >
                                        Médio (40px)
                                      </button>
                                      <button
                                        onClick={() => handleBlockChange(test.id, block.id, 'spacerHeight', 'large')}
                                        className={`px-2 py-1 text-[9px] font-bold ${(block.spacerHeight === 'large') ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                                      >
                                        Grande (80px)
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Visual Preview Box */}
                              <div className="mt-2 flex items-center justify-center border border-dashed border-purple-200 rounded bg-white relative overflow-hidden transition-all duration-300"
                                   style={{ 
                                     height: block.spacerType === 'page_break' 
                                       ? '40px' 
                                       : block.spacerHeight === 'small' 
                                         ? '20px' 
                                         : block.spacerHeight === 'large' 
                                           ? '80px' 
                                           : '40px' 
                                   }}
                              >
                                <span className="text-[9px] font-black text-purple-300 uppercase tracking-widest select-none pointer-events-none">
                                  {block.spacerType === 'page_break' ? '[ QUEBRA DE PÁGINA ]' : `[ ESPAÇO VERTICAL: ${block.spacerHeight === 'small' ? '20PX' : block.spacerHeight === 'large' ? '80PX' : '40PX'} ]`}
                                </span>
                              </div>
                            </div>
                          )}

                          {block.type === 'topology' && (
                            <div className="border border-dashed border-teal-200 rounded-lg p-4 flex flex-col items-center justify-center bg-teal-50/30">
                              {block.content ? (
                                <div className="space-y-3 w-full flex flex-col items-center">
                                  <img src={block.content} alt="Topologia do Caso de Teste" className="max-w-full rounded shadow-sm border border-slate-200 bg-white" />
                                  <button 
                                    onClick={() => setActiveTopologyBlockId({ testId: test.id, blockId: block.id })}
                                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded shadow-sm text-xs font-bold flex items-center gap-2"
                                  >
                                    <Network size={14} /> Editar Topologia
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setActiveTopologyBlockId({ testId: test.id, blockId: block.id })}
                                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded shadow-sm text-xs font-bold flex items-center gap-2"
                                >
                                  <Network size={16} /> Desenhar Topologia
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!test.blocks || test.blocks.length === 0) && (
                    <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/30">
                      <Layout size={24} className="text-slate-200 mb-2" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.testExecution.blocks.emptyScenario}</p>
                    </div>
                  )}
                </div>

                {/* BOTTOM BLOCK TOOLBAR */}
                {test.blocks && test.blocks.length > 0 && (
                  <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-lg border border-dashed border-slate-200 justify-center flex-wrap mt-2">
                    <button onClick={() => addBlock(test.id, 'subtopic')} className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-indigo-600 hover:bg-indigo-100 rounded transition-colors uppercase">
                      <Layout size={12}/> {t.testExecution.blocks.subtopic}
                    </button>
                    <div className="w-[1px] h-3 bg-slate-200"></div>
                    <button onClick={() => addBlock(test.id, 'subtitle')} className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-violet-600 hover:bg-violet-100 rounded transition-colors uppercase">
                      <Heading2 size={12}/> {t.testExecution.blocks.subtitle}
                    </button>
                    <div className="w-[1px] h-3 bg-slate-200"></div>
                    <button onClick={() => addBlock(test.id, 'step')} className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-emerald-600 hover:bg-emerald-100 rounded transition-colors uppercase">
                      <Type size={12}/> {t.testExecution.blocks.step}
                    </button>
                    <div className="w-[1px] h-3 bg-slate-200"></div>
                    <button onClick={() => addBlock(test.id, 'list')} className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-blue-600 hover:bg-blue-100 rounded transition-colors uppercase">
                      <List size={12}/> {t.testExecution.blocks.list}
                    </button>
                    <div className="w-[1px] h-3 bg-slate-200"></div>
                    <button onClick={() => addBlock(test.id, 'code')} className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-slate-600 hover:bg-slate-200 rounded transition-colors uppercase">
                      <Code size={12}/> {t.testExecution.blocks.code}
                    </button>
                    <div className="w-[1px] h-3 bg-slate-200"></div>
                    <button onClick={() => addBlock(test.id, 'image')} className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-amber-600 hover:bg-amber-100 rounded transition-colors uppercase">
                      <ImageIcon size={12}/> {t.testExecution.blocks.image}
                    </button>
                    <div className="w-[1px] h-3 bg-slate-200"></div>
                    <button onClick={() => addBlock(test.id, 'image_grid')} className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-pink-600 hover:bg-pink-100 rounded transition-colors uppercase">
                      <Smartphone size={12}/> {t.testExecution.blocks.imageGrid}
                    </button>
                    <div className="w-[1px] h-3 bg-slate-200"></div>
                    <button onClick={() => addBlock(test.id, 'spacer')} className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-purple-600 hover:bg-purple-100 rounded transition-colors uppercase">
                      <SeparatorHorizontal size={12}/> {t.testExecution.blocks.spacer}
                    </button>
                    <div className="w-[1px] h-3 bg-slate-200"></div>
                    <button onClick={() => addBlock(test.id, 'topology')} className="flex items-center gap-1 px-2 py-1 text-[8px] font-bold text-teal-600 hover:bg-teal-100 rounded transition-colors uppercase">
                      <Network size={12}/> Topologia
                    </button>
                  </div>
                )}

                {/* RESULTS */}
                {!reportData.isPublic && (
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{t.testExecution.expectedResult}</label>
                      <textarea 
                        placeholder="..." 
                        value={test.expectedResult} 
                        onChange={e => handleTestChange(test.id, 'expectedResult', e.target.value)} 
                        className="w-full text-[11px] p-2 border rounded border-gray-100 h-16 outline-none focus:border-emerald-300" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{t.testExecution.actualResult}</label>
                      <textarea 
                        placeholder="..." 
                        value={test.actualResult} 
                        onChange={e => handleTestChange(test.id, 'actualResult', e.target.value)} 
                        className="w-full text-[11px] p-2 border rounded border-gray-100 h-16 outline-none focus:border-red-300" 
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      {/* Renderização do Modal de Topologia se houver um bloco ativo */}
      {activeTopologyBlockId && (
        <TopologyModal 
          isOpen={!!activeTopologyBlockId} 
          onClose={() => setActiveTopologyBlockId(null)}
          initialData={
            (() => {
              if (!activeTopologyBlockId) return null;
              const test = reportData.tests.find(t => t.id === activeTopologyBlockId.testId);
              const block = test?.blocks?.find(b => b.id === activeTopologyBlockId.blockId);
              return block?.topologyData || null;
            })()
          }
          onSaveImage={({ file, nodes, edges }) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const test = reportData.tests.find(t => t.id === activeTopologyBlockId.testId);
              if (test) {
                const newBlocks = test.blocks.map(b => {
                  if (b.id === activeTopologyBlockId.blockId) {
                    return { ...b, content: event.target.result, topologyData: { nodes, edges } };
                  }
                  return b;
                });
                handleTestChange(activeTopologyBlockId.testId, 'blocks', newBlocks);
              }
              setActiveTopologyBlockId(null);
            };
            reader.readAsDataURL(file);
          }}
        />
      )}
    </section>
  );
};

export default TestExecutionForm;
