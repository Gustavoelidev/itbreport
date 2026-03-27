import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import IdentificationForm from './IdentificationForm';
import BaseContentForm from './BaseContentForm';
import InfrastructureForm from './InfrastructureForm';
import TestExecutionForm from './TestExecutionForm';
import ChangelogModal from '../ui/ChangelogModal';

const CollapsibleSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-0 pb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 transition-colors hover:bg-gray-50 rounded px-1"
      >
        <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
          {title}
        </h3>
        {isOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
      </button>
      
      {isOpen && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

const EditorSidebar = (props) => {
  const [showChangelog, setShowChangelog] = useState(false);

  return (
    <aside className="w-full md:w-[420px] bg-white border-r border-gray-200 h-full flex flex-col z-10 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
        <CollapsibleSection title={props.t.sidebar.identification} defaultOpen={true}>
          <IdentificationForm 
            reportData={props.reportData} 
            handleInputChange={props.handleInputChange} 
            t={props.t}
          />
        </CollapsibleSection>
        
        <CollapsibleSection title={props.t.sidebar.baseContent}>
          <BaseContentForm 
            reportData={props.reportData} 
            handleInputChange={props.handleInputChange} 
            t={props.t}
          />
        </CollapsibleSection>
        
        <CollapsibleSection title={props.t.sidebar.infrastructure}>
          <InfrastructureForm 
            reportData={props.reportData} 
            handleInfraChange={props.handleInfraChange} 
            addInfraItem={props.addInfraItem} 
            removeInfraItem={props.removeInfraItem} 
            t={props.t}
          />
        </CollapsibleSection>
        
        <CollapsibleSection title={props.t.sidebar.testExecution} defaultOpen={true}>
          <TestExecutionForm 
            reportData={props.reportData} 
            handleTestChange={props.handleTestChange} 
            addTestCase={props.addTestCase} 
            removeTestCase={props.removeTestCase} 
            handleImageUpload={props.handleImageUpload} 
            removeEvidence={props.removeEvidence} 
            updateEvidenceDescription={props.updateEvidenceDescription} 
            addCodeBlock={props.addCodeBlock}
            removeCodeBlock={props.removeCodeBlock}
            handleCodeBlockChange={props.handleCodeBlockChange}
            addBlock={props.addBlock}
            removeBlock={props.removeBlock}
            handleBlockChange={props.handleBlockChange}
            handleBlockImageUpload={props.handleBlockImageUpload}
            addListItem={props.addListItem}
            removeListItem={props.removeListItem}
            handleListItemChange={props.handleListItemChange}
            moveBlock={props.moveBlock}
            t={props.t}
          />
        </CollapsibleSection>
      </div>

      <div className="p-4 border-t border-gray-50 bg-gray-50/30 flex flex-col items-center justify-center opacity-80 shrink-0">
        <div className="flex items-center gap-2">
          <p className="text-[9px] text-gray-400 font-medium text-center leading-relaxed">
            {props.t.sidebar.developedBy}
          </p>
          <button 
            onClick={() => setShowChangelog(true)} 
            className="text-[9px] font-black text-[#00a335] hover:text-white bg-green-50 hover:bg-[#00a335] px-1.5 py-0.5 rounded transition-colors"
          >
            v1.0.2
          </button>
        </div>
      </div>

      <ChangelogModal isOpen={showChangelog} onClose={() => setShowChangelog(false)} t={props.t} />
    </aside>
  );
};

export default EditorSidebar;
