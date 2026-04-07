import { useState, useEffect } from 'react';
import { defaultReportState } from '../constants/defaultReportState';
import { compressImage } from '../lib/imageUtils';

/**
 * Hook customizado React dedicado ao gerenciamento do estado central do Relatório de QA.
 * Lida com persistência via window.localStorage e expõe ações atômicas
 * para manipular testes, infraestrutura e blocos internos de forma segura e imutável.
 * 
 * @returns {Object} Estado do relatório e manipuladores de ações associáveis.
 */
export const useReportData = () => {
  const [reportData, setReportData] = useState(() => {
    const saved = localStorage.getItem('qa_report_data');
    return saved ? JSON.parse(saved) : defaultReportState;
  });

  useEffect(() => {
    try {
      localStorage.setItem('qa_report_data', JSON.stringify(reportData));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        alert('O armazenamento do navegador está cheio. Tente remover imagens ou limpar dados antigos.');
      }
      console.error('Erro ao salvar no localStorage:', e);
    }
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

  const duplicateTestCase = (id) => {
    const currentTest = reportData.tests.find(t => t.id === id);
    if (!currentTest) return;
    
    const newTest = {
      ...currentTest,
      id: Date.now(),
      scenario: `${currentTest.scenario || ''} (Cópia)`,
      blocks: currentTest.blocks ? currentTest.blocks.map(b => ({
        ...b,
        id: Date.now() + Math.random(),
        items: b.items ? b.items.map(i => ({ ...i, id: Date.now() + Math.random() })) : []
      })) : []
    };

    setReportData(prev => {
      const index = prev.tests.findIndex(t => t.id === id);
      const newTests = [...prev.tests];
      newTests.splice(index + 1, 0, newTest);
      return { ...prev, tests: newTests };
    });
  };

  const moveTestCase = (id, direction) => {
    setReportData(prev => {
      const tests = [...prev.tests];
      const index = tests.findIndex(t => t.id === id);
      if (direction === 'up' && index > 0) {
        [tests[index], tests[index - 1]] = [tests[index - 1], tests[index]];
      } else if (direction === 'down' && index < tests.length - 1) {
        [tests[index], tests[index + 1]] = [tests[index + 1], tests[index]];
      }
      return { ...prev, tests };
    });
  };

  const handleImageUpload = async (testId, e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        const newEvidence = {
          id: Date.now(),
          url: compressed,
          description: ''
        };
        const currentTest = reportData.tests.find(t => t.id === testId);
        handleTestChange(testId, 'evidences', [...(currentTest.evidences || []), newEvidence]);
      } catch (err) {
        console.error('Erro ao processar imagem:', err);
      }
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

  const addBlock = (testId, type) => {
    const newBlock = {
      id: Date.now(),
      type: type, // 'step', 'subtopic', 'code', 'image', 'list', 'image_grid'
      content: '',
      description: '',
      listType: 'bullet', // 'bullet' or 'number'
      items: (type === 'list' || type === 'image_grid') ? [] : []
    };
    
    // Inicializar lista com um item se for tipo list
    if (type === 'list') {
      newBlock.items = [{ id: Date.now(), text: '' }];
    }

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

  const handleBlockImageUpload = async (testId, blockId, e) => {
    // Suporta input file (e.target.files) ou paste (e.clipboardData.files) ou arquivo direto
    const file = e.target?.files?.[0] || e.clipboardData?.files?.[0] || e;
    
    if (file instanceof File) {
      try {
        const compressed = await compressImage(file);
        handleBlockChange(testId, blockId, 'content', compressed);
      } catch (err) {
        console.error('Erro ao processar imagem:', err);
      }
    }
    if (e.target) e.target.value = '';
  };

  const handleGridImageUpload = async (testId, blockId, e) => {
    // Pode vir de um input (e.target.files) ou de um paste (passando o arquivo direto ou evento customizado)
    const file = e.target?.files?.[0] || e.clipboardData?.files?.[0] || e;
    
    if (file instanceof File) {
      try {
        const compressed = await compressImage(file);
        setReportData(prev => ({
          ...prev,
          tests: prev.tests.map(t => t.id === testId ? {
            ...t,
            blocks: t.blocks.map(b => b.id === blockId ? {
              ...b,
              items: [...(b.items || []), { id: Date.now(), content: compressed }]
            } : b)
          } : t)
        }));
      } catch (err) {
        console.error('Erro ao processar imagem do grid:', err);
      }
    }
    if (e.target) e.target.value = '';
  };

  const removeGridImage = (testId, blockId, imageId) => {
    setReportData(prev => ({
      ...prev,
      tests: prev.tests.map(t => t.id === testId ? {
        ...t,
        blocks: t.blocks.map(b => b.id === blockId ? {
          ...b,
          items: b.items.filter(img => img.id !== imageId)
        } : b)
      } : t)
    }));
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
    duplicateTestCase,
    moveTestCase,
    handleImageUpload,
    removeEvidence,
    updateEvidenceDescription,
    addBlock,
    removeBlock,
    handleBlockChange,
    handleBlockImageUpload,
    handleGridImageUpload,
    removeGridImage,
    addListItem,
    removeListItem,
    handleListItemChange,
    moveBlock,
    setReportData
  };
};
