import React from 'react';
import IdentificationForm from './IdentificationForm';
import BaseContentForm from './BaseContentForm';
import InfrastructureForm from './InfrastructureForm';
import TestExecutionForm from './TestExecutionForm';

const EditorSidebar = (props) => {
  return (
    <aside className="w-full md:w-[420px] bg-white border-r border-gray-200 overflow-y-auto p-6 space-y-6 pb-32 z-10">
      <IdentificationForm 
        reportData={props.reportData} 
        handleInputChange={props.handleInputChange} 
      />
      
      <BaseContentForm 
        reportData={props.reportData} 
        handleInputChange={props.handleInputChange} 
      />
      
      <InfrastructureForm 
        reportData={props.reportData} 
        handleInfraChange={props.handleInfraChange} 
        addInfraItem={props.addInfraItem} 
        removeInfraItem={props.removeInfraItem} 
      />
      
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
      />
    </aside>
  );
};

export default EditorSidebar;
