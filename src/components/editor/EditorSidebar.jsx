import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import IdentificationForm from './IdentificationForm';
import BaseContentForm from './BaseContentForm';
import InfrastructureForm from './InfrastructureForm';
import TestExecutionForm from './TestExecutionForm';

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
  return (
    <aside className="w-full md:w-[420px] bg-white border-r border-gray-200 overflow-y-auto p-6 space-y-4 pb-32 z-10 scrollbar-thin scrollbar-thumb-gray-200">
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
    </aside>
  );
};

export default EditorSidebar;
