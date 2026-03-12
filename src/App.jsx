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
    if (window.confirm(t.translations.confirmTranslate)) {
      setIsTranslating(true);
      const from = lang === 'pt' ? 'pt' : 'en';
      const to = lang === 'pt' ? 'en' : 'pt';

      try {
        const newData = { ...reportData };
        
        // Traduz campos básicos (em paralelo)
        const [title, intro, obj, pre] = await Promise.all([
          translateText(newData.title, from, to),
          translateText(newData.introduction, from, to),
          translateText(newData.objectives, from, to),
          translateText(newData.prerequisites, from, to)
        ]);

        newData.title = title;
        newData.introduction = intro;
        newData.objectives = obj;
        newData.prerequisites = pre;

        // Traduz testes
        if (newData.tests && newData.tests.length > 0) {
          newData.tests = await Promise.all(newData.tests.map(async (test) => {
            const translatedTest = { 
              ...test,
              scenario: await translateText(test.scenario, from, to),
              description: await translateText(test.description, from, to),
              expectedResult: await translateText(test.expectedResult, from, to),
              actualResult: await translateText(test.actualResult, from, to)
            };

            if (test.blocks && test.blocks.length > 0) {
              translatedTest.blocks = await Promise.all(test.blocks.map(async (block) => {
                const newBlock = { ...block };
                
                // Traduz o conteúdo principal do bloco
                if (block.type !== 'image' && block.type !== 'code' && block.content) {
                  newBlock.content = await translateText(block.content, from, to);
                }
                
                // Traduz descrição/legenda se houver
                if (block.description) {
                  newBlock.description = await translateText(block.description, from, to);
                }
                
                // Traduz itens de lista
                if (block.type === 'list' && block.items) {
                  newBlock.items = await Promise.all(block.items.map(async (item) => ({
                    ...item,
                    text: await translateText(item.text, from, to)
                  })));
                }
                
                return newBlock;
              }));
            }
            return translatedTest;
          }));
        }

        setReportData(newData);
        setLang(to); // Sincroniza o idioma da interface
      } catch (err) {
        console.error("Erro durante a tradução do relatório:", err);
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
