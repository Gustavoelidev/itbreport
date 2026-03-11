import { useState } from 'react';
import { defaultReportState } from '../constants/defaultReportState';

export const useReportData = () => {
  const [reportData, setReportData] = useState(defaultReportState);

  const handleInputChange = (e, field) => {
    setReportData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleInfraChange = (id, field, value) => {
    setReportData(prev => ({
      ...prev,
      infrastructure: prev.infrastructure.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addInfraItem = () => {
    setReportData(prev => ({
      ...prev,
      infrastructure: [...prev.infrastructure, { id: Date.now(), type: 'AP', model: '', firmware: '' }]
    }));
  };

  const removeInfraItem = (id) => {
    setReportData(prev => ({
      ...prev,
      infrastructure: prev.infrastructure.filter(item => item.id !== id)
    }));
  };

  const handleTestChange = (id, field, value) => {
    setReportData(prev => ({
      ...prev,
      tests: prev.tests.map(t => t.id === id ? { ...t, [field]: value } : t)
    }));
  };

  const addTestCase = () => {
    setReportData(prev => ({
      ...prev,
      tests: [
        ...prev.tests,
        {
          id: Date.now(),
          scenario: '',
          description: '',
          steps: '',
          codeBlocks: [],
          expectedResult: '',
          actualResult: '',
          status: 'Pass',
          evidences: []
        }
      ]
    }));
  };

  const removeTestCase = (id) => {
    if (reportData.tests.length === 1) return;
    setReportData(prev => ({
      ...prev,
      tests: prev.tests.filter(t => t.id !== id)
    }));
  };

  const handleImageUpload = (testId, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newEvidence = {
          id: Date.now(),
          url: reader.result,
          description: ''
        };
        const currentTest = reportData.tests.find(t => t.id === testId);
        handleTestChange(testId, 'evidences', [...currentTest.evidences, newEvidence]);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const removeEvidence = (testId, evidenceId) => {
    const currentTest = reportData.tests.find(t => t.id === testId);
    handleTestChange(testId, 'evidences', currentTest.evidences.filter(ev => ev.id !== evidenceId));
  };

  const updateEvidenceDescription = (testId, evidenceId, description) => {
    const currentTest = reportData.tests.find(t => t.id === testId);
    handleTestChange(testId, 'evidences', currentTest.evidences.map(ev => 
      ev.id === evidenceId ? { ...ev, description } : ev
    ));
  };

  const addCodeBlock = (testId) => {
    const currentTest = reportData.tests.find(t => t.id === testId);
    handleTestChange(testId, 'codeBlocks', [
      ...currentTest.codeBlocks,
      { id: Date.now(), description: '', content: '' }
    ]);
  };

  const removeCodeBlock = (testId, blockId) => {
    const currentTest = reportData.tests.find(t => t.id === testId);
    handleTestChange(testId, 'codeBlocks', currentTest.codeBlocks.filter(b => b.id !== blockId));
  };

  const handleCodeBlockChange = (testId, blockId, field, value) => {
    const currentTest = reportData.tests.find(t => t.id === testId);
    handleTestChange(testId, 'codeBlocks', currentTest.codeBlocks.map(b => 
      b.id === blockId ? { ...b, [field]: value } : b
    ));
  };

  return {
    reportData,
    handleInputChange,
    handleInfraChange,
    addInfraItem,
    removeInfraItem,
    handleTestChange,
    addTestCase,
    removeTestCase,
    handleImageUpload,
    removeEvidence,
    updateEvidenceDescription,
    addCodeBlock,
    removeCodeBlock,
    handleCodeBlockChange
  };
};
