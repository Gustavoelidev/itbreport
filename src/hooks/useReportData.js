import { useState, useEffect } from 'react';
import { defaultReportState } from '../constants/defaultReportState';

export const useReportData = () => {
  const [reportData, setReportData] = useState(() => {
    const saved = localStorage.getItem('qa_report_data');
    return saved ? JSON.parse(saved) : defaultReportState;
  });

  useEffect(() => {
    localStorage.setItem('qa_report_data', JSON.stringify(reportData));
  }, [reportData]);

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
          status: 'Pass',
          expectedResult: '',
          actualResult: '',
          blocks: []
        }
      ]
    }));
  };

  const removeTestCase = (id) => {
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
        handleTestChange(testId, 'evidences', [...(currentTest.evidences || []), newEvidence]);
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

  // Block System Handlers
  const addBlock = (testId, type) => {
    const newBlock = {
      id: Date.now(),
      type: type, // 'step', 'subtopic', 'code', 'image', 'list'
      content: '',
      description: '',
      listType: 'bullet', // 'bullet' or 'number'
      items: type === 'list' ? [{ id: Date.now(), text: '' }] : []
    };
    const currentTest = reportData.tests.find(t => t.id === testId);
    handleTestChange(testId, 'blocks', [...(currentTest.blocks || []), newBlock]);
  };

  const removeBlock = (testId, blockId) => {
    const currentTest = reportData.tests.find(t => t.id === testId);
    handleTestChange(testId, 'blocks', currentTest.blocks.filter(b => b.id !== blockId));
  };

  const handleBlockChange = (testId, blockId, field, value) => {
    const currentTest = reportData.tests.find(t => t.id === testId);
    handleTestChange(testId, 'blocks', currentTest.blocks.map(b => 
      b.id === blockId ? { ...b, [field]: value } : b
    ));
  };

  const handleBlockImageUpload = (testId, blockId, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleBlockChange(testId, blockId, 'content', reader.result);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const addListItem = (testId, blockId) => {
    const currentTest = reportData.tests.find(t => t.id === testId);
    handleTestChange(testId, 'blocks', currentTest.blocks.map(b => {
      if (b.id === blockId) {
        return { ...b, items: [...b.items, { id: Date.now(), text: '' }] };
      }
      return b;
    }));
  };

  const removeListItem = (testId, blockId, itemId) => {
    const currentTest = reportData.tests.find(t => t.id === testId);
    handleTestChange(testId, 'blocks', currentTest.blocks.map(b => {
      if (b.id === blockId) {
        return { ...b, items: b.items.filter(i => i.id !== itemId) };
      }
      return b;
    }));
  };

  const handleListItemChange = (testId, blockId, itemId, text) => {
    const currentTest = reportData.tests.find(t => t.id === testId);
    handleTestChange(testId, 'blocks', currentTest.blocks.map(b => {
      if (b.id === blockId) {
        return { ...b, items: b.items.map(i => i.id === itemId ? { ...i, text } : i) };
      }
      return b;
    }));
  };

  const moveBlock = (testId, blockId, direction) => {
    const currentTest = reportData.tests.find(t => t.id === testId);
    const blocks = [...currentTest.blocks];
    const index = blocks.findIndex(b => b.id === blockId);
    if (direction === 'up' && index > 0) {
      [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
    } else if (direction === 'down' && index < blocks.length - 1) {
      [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
    }
    handleTestChange(testId, 'blocks', blocks);
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
    addBlock,
    removeBlock,
    handleBlockChange,
    handleBlockImageUpload,
    addListItem,
    removeListItem,
    handleListItemChange,
    moveBlock,
    setReportData
  };
};
