import React from 'react';
import { Plus, Trash2, Code, X, Image as ImageIcon, Type, Layout, List, ChevronUp, ChevronDown, ListOrdered, ChevronRight, Copy, GripVertical } from 'lucide-react';
import {
  DndContext,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableBlockItem = ({ 
  test, 
  block, 
  handleBlockChange, 
  handleBlockImageUpload, 
  addListItem, 
  removeListItem, 
  handleListItemChange, 
  moveBlock, 
  removeBlock, 
  t 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative pl-4 border-l-2 border-slate-100 group/block ${isDragging ? 'bg-slate-50 ring-2 ring-[#00a335] ring-opacity-10 rounded-lg' : ''}`}
    >
      <div className="absolute -left-[9px] top-0 flex flex-col items-center bg-white">
        <div 
          {...attributes}
          {...listeners}
          className={`w-4 h-4 rounded-full border-2 border-slate-200 flex items-center justify-center bg-white cursor-grab active:cursor-grabbing hover:border-[#00a335] transition-colors`}
          title="Segure para arrastar"
        >
          {block.type === 'subtopic' && <Layout size={8} className="text-indigo-500 fill-indigo-50" />}
          {block.type === 'step' && <Type size={8} className="text-emerald-500" />}
          {block.type === 'list' && <List size={8} className="text-blue-500" />}
          {block.type === 'code' && <Code size={8} className="text-slate-500" />}
          {block.type === 'image' && <ImageIcon size={8} className="text-amber-500 fill-amber-50" />}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">
              {block.type === 'subtopic' ? t.testExecution.blocks.subtopic : block.type === 'step' ? t.testExecution.blocks.step : block.type === 'code' ? t.testExecution.blocks.code : block.type === 'list' ? t.testExecution.blocks.list : t.testExecution.blocks.image}
            </span>
            <div 
              {...attributes}
              {...listeners}
              className="opacity-0 group-hover/block:opacity-100 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-all"
            >
              <GripVertical size={10} />
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover/block:opacity-100 transition-opacity">
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
            className="w-full text-xs font-bold bg-white outline-none border-b border-gray-100 focus:border-indigo-400"
          />
        )}

        {block.type === 'step' && (
          <textarea 
            placeholder={t.testExecution.blocks.placeholderStep} 
            value={block.content}
            onChange={e => handleBlockChange(test.id, block.id, 'content', e.target.value)}
            className="w-full text-[11px] p-2 bg-white border border-gray-100 rounded outline-none focus:border-emerald-400 min-h-[60px]"
          />
        )}

        {block.type === 'list' && (
          <div className="space-y-2">
            <div className="flex gap-2 items-center bg-slate-50 p-1 rounded">
              <button 
                onClick={() => handleBlockChange(test.id, block.id, 'listType', 'bullet')}
                className={`p-1 rounded ${block.listType === 'bullet' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-200'}`}
              >
                <List size={12}/>
              </button>
              <button 
                onClick={() => handleBlockChange(test.id, block.id, 'listType', 'number')}
                className={`p-1 rounded ${block.listType === 'number' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-200'}`}
              >
                <ListOrdered size={12}/>
              </button>
            </div>
            
            <div className="space-y-1">
              {block.items.map((item, iIndex) => (
                <div key={item.id} className="flex gap-2 items-start group/item">
                  <span className="text-[10px] text-gray-400 mt-1.5 w-4 text-center font-bold">
                    {block.listType === 'number' ? `${iIndex + 1}.` : '•'}
                  </span>
                  <input 
                    placeholder="..." 
                    value={item.text}
                    onChange={e => handleListItemChange(test.id, block.id, item.id, e.target.value)}
                    className="flex-1 text-[11px] p-1 border-b border-transparent focus:border-blue-200 outline-none"
                  />
                  <button 
                    onClick={() => removeListItem(test.id, block.id, item.id)}
                    className="opacity-0 group-hover/item:opacity-100 p-1 text-gray-300 hover:text-red-500"
                  >
                    <X size={10}/>
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => addListItem(test.id, block.id)}
              className="w-full py-1 text-[9px] font-bold text-blue-500 border border-dashed border-blue-200 rounded hover:bg-blue-50 transition-colors uppercase"
            >
              + {t.testExecution.blocks.list}
            </button>
          </div>
        )}

        {block.type === 'code' && (
          <div className="space-y-2">
            <input 
              placeholder={t.testExecution.blocks.placeholderCodeDesc} 
              value={block.description}
              onChange={e => handleBlockChange(test.id, block.id, 'description', e.target.value)}
              className="w-full text-[10px] font-medium text-slate-500 outline-none italic"
            />
            <textarea 
              placeholder={t.testExecution.blocks.placeholderCode} 
              value={block.content}
              onChange={e => handleBlockChange(test.id, block.id, 'content', e.target.value)}
              className="w-full text-[11px] p-3 bg-gray-900 text-[#50fa7b] font-mono rounded border border-gray-800 outline-none min-h-[120px] h-auto scrollbar-hide shadow-inner leading-relaxed"
              style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
            />
          </div>
        )}

        {block.type === 'image' && (
          <div 
            className="space-y-3 outline-none focus:ring-1 focus:ring-slate-200 rounded-md p-1 -m-1"
            tabIndex={0}
            title="Você pode clicar aqui e usar Ctrl+V para colar uma imagem"
            onPaste={(e) => {
              const file = e.clipboardData?.files?.[0];
              if (file && file.type.startsWith('image/')) {
                handleBlockImageUpload(test.id, block.id, { target: { files: [file], value: '' } });
              }
            }}
          >
            {block.content ? (
              <div className="relative group/img overflow-hidden rounded-md border border-slate-200 shadow-sm bg-slate-50">
                <img src={block.content} className="w-full max-h-[400px] object-contain mx-auto" alt="Preview"/>
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-[10px] text-white font-bold uppercase">{t.testExecution.blocks.image}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleBlockImageUpload(test.id, block.id, e)} />
                </label>
              </div>
            ) : (
              <div 
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-indigo-200 rounded-lg bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-300 transition-colors outline-none cursor-text focus:ring-2 focus:ring-indigo-400/50 group/box"
                tabIndex={0}
                onPaste={(e) => {
                  const file = e.clipboardData?.files?.[0];
                  if (file && file.type.startsWith('image/')) {
                    handleBlockImageUpload(test.id, block.id, { target: { files: [file], value: '' } });
                  }
                }}
              >
                <ImageIcon size={22} className="text-indigo-300 group-hover/box:text-indigo-500 transition-colors mb-1" />
                <span className="text-[10px] font-medium text-slate-500 mb-1">{t.testExecution.blocks.placeholderImage}</span>
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-100/70 px-2 py-1 rounded">
                  Clique e aperte Ctrl + V
                </span>
                <label className="mt-3 text-[9px] font-bold text-[#00a335] hover:text-[#008a2d] hover:underline cursor-pointer uppercase tracking-wider">
                  Ou procurar arquivo...
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleBlockImageUpload(test.id, block.id, e)} />
                </label>
              </div>
            )}
            <input 
              placeholder={t.testExecution.blocks.placeholderImage} 
              value={block.description}
              onChange={e => handleBlockChange(test.id, block.id, 'description', e.target.value)}
              className="w-full text-[10px] p-1.5 border border-gray-100 rounded focus:border-amber-400 outline-none bg-slate-50/50"
            />
          </div>
        )}
      </div>
    </div>
  );
};

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
  reorderBlocks,
  t
}) => {
  const [collapsedTests, setCollapsedTests] = React.useState({});

  const toggleCollapse = (id) => {
    setCollapsedTests(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleDragEnd = (event, testId) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const test = reportData.tests.find(t => t.id === testId);
      if (!test) return;
      
      const oldIndex = test.blocks.findIndex(b => b.id === active.id);
      const newIndex = test.blocks.findIndex(b => b.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderBlocks(testId, oldIndex, newIndex);
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

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
                </div>

                {/* RENDER BLOCKS */}
                <div className="space-y-4 min-h-[50px]">
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={pointerWithin}
                    onDragEnd={(e) => handleDragEnd(e, test.id)}
                  >
                    <SortableContext 
                      items={test.blocks ? test.blocks.map(b => b.id) : []}
                      strategy={verticalListSortingStrategy}
                    >
                      {test.blocks && test.blocks.map((block, bIndex) => (
                        <SortableBlockItem 
                          key={block.id}
                          test={test}
                          block={block}
                          handleBlockChange={handleBlockChange}
                          handleBlockImageUpload={handleBlockImageUpload}
                          addListItem={addListItem}
                          removeListItem={removeListItem}
                          handleListItemChange={handleListItemChange}
                          moveBlock={moveBlock}
                          removeBlock={removeBlock}
                          t={t}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                  
                  {(!test.blocks || test.blocks.length === 0) && (
                    <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/30">
                      <Layout size={24} className="text-slate-200 mb-2" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.testExecution.blocks.emptyScenario}</p>
                    </div>
                  )}
                </div>

                {/* RESULTS */}
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
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
};

export default TestExecutionForm;
