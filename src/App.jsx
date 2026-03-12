import React, { useRef, useState } from 'react';
import Header from './components/layout/Header';
import EditorSidebar from './components/editor/EditorSidebar';
import DocumentPreview from './components/preview/DocumentPreview';
import LoadingOverlay from './components/layout/LoadingOverlay';
import { useReportData } from './hooks/useReportData';
import { generatePDF } from './services/exportPdf';
import { generateDOCX } from './services/exportDocx';
import { translations } from './constants/translations';
import { templates } from './constants/templates';
import { translateText } from './services/translationService';

const App = () => {
  const previewRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lang, setLang] = useState('pt');
  
  const reportStateUtils = useReportData();
  const { reportData, setReportData } = reportStateUtils;
  const t = translations[lang];

  const handleApplyTemplate = (templateId) => {
    const template = templates.find(temp => temp.id === templateId);
    if (template && window.confirm(t.templates.confirmChange)) {
      setReportData(prev => ({
        ...prev,
        ...template.state,
        date: prev.date // Mantém a data atual
      }));
    }
  };

  const handleAutoTranslateReport = async () => {
    if (!reportData || !reportData.tests) return;
    
    if (window.confirm(t.translations.confirmTranslate)) {
      setIsTranslating(true);
      const from = lang === 'pt' ? 'pt' : 'en';
      const to = lang === 'pt' ? 'en' : 'pt';

      try {
        // Criamos uma cópia profunda para não mutar o estado diretamente
        const newData = JSON.parse(JSON.stringify(reportData));
        
        // Traduz campos básicos (Um por um para não sobrecarregar a API gratuita)
        newData.title = await translateText(newData.title, from, to);
        newData.introduction = await translateText(newData.introduction, from, to);
        newData.objectives = await translateText(newData.objectives, from, to);
        newData.prerequisites = await translateText(newData.prerequisites, from, to);

        // Traduz testes de forma sequencial
        for (let i = 0; i < newData.tests.length; i++) {
          const test = newData.tests[i];
          test.scenario = await translateText(test.scenario, from, to);
          test.description = await translateText(test.description, from, to);
          test.expectedResult = await translateText(test.expectedResult, from, to);
          test.actualResult = await translateText(test.actualResult, from, to);

          if (test.blocks && test.blocks.length > 0) {
            for (let j = 0; j < test.blocks.length; j++) {
              const block = test.blocks[j];
              
              if (block.type !== 'image' && block.type !== 'code' && block.content) {
                block.content = await translateText(block.content, from, to);
              }
              
              if (block.description) {
                block.description = await translateText(block.description, from, to);
              }
              
              if (block.type === 'list' && block.items) {
                for (let k = 0; k < block.items.length; k++) {
                  block.items[k].text = await translateText(block.items[k].text, from, to);
                }
              }
            }
          }
        }

        setReportData(newData);
        setLang(to); 
      } catch (err) {
        console.error("Erro crítico na tradução:", err);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    await generatePDF(previewRef.current, reportData.title);
    setIsExporting(false);
  };

  const handleExportDOCX = async () => {
    setIsExporting(true);
    await generateDOCX(reportData, t);
    setIsExporting(false);
  };

  return (
    <div className="h-screen bg-[#f3f4f6] flex flex-col font-sans text-slate-800 overflow-hidden">
      <Header 
        onExportDOCX={handleExportDOCX} 
        onExportPDF={handleExportPDF} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        lang={lang}
        setLang={setLang}
        t={t}
        onApplyTemplate={handleApplyTemplate}
        onAutoTranslate={handleAutoTranslateReport}
        isTranslating={isTranslating}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <div 
          className="bg-white border-r border-gray-200 transition-all duration-500 ease-in-out overflow-hidden flex-shrink-0 z-10"
          style={{ width: sidebarOpen ? '420px' : '0' }}
        >
          <div className="w-[420px] h-full overflow-y-auto">
            <EditorSidebar {...reportStateUtils} lang={lang} t={t} />
          </div>
        </div>

        {/* Área Principal */}
        <main className="flex-1 bg-gray-200 overflow-y-auto p-12 flex flex-col items-center scroll-smooth relative z-0 transition-all duration-500 ease-in-out">
          <div className="w-full flex justify-center">
            <DocumentPreview ref={previewRef} reportData={reportData} lang={lang} t={t} />
          </div>
        </main>
      </div>

      {(isExporting || isTranslating) && (
        <LoadingOverlay 
          message={isTranslating ? t.translations.translating : undefined} 
        />
      )}
    </div>
  );
};

export default App;
