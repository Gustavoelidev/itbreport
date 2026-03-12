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
        console.log(`Iniciando tradução de ${from} para ${to}...`);
        
        // Cópia profunda para garantir reatividade total
        const newData = JSON.parse(JSON.stringify(reportData));
        
        // Função auxiliar para tradução com pequeno delay (evita bloqueio da API)
        const safeTranslate = async (txt) => {
          if (!txt) return txt;
          const res = await translateText(txt, from, to);
          await new Promise(r => setTimeout(r, 100)); // Delay de 100ms entre chamadas
          return res;
        };

        // 1. Campos Base
        newData.title = await safeTranslate(newData.title);
        newData.introduction = await safeTranslate(newData.introduction);
        newData.objectives = await safeTranslate(newData.objectives);
        newData.prerequisites = await safeTranslate(newData.prerequisites);

        // 2. Infraestrutura (Modelos)
        if (newData.infrastructure) {
          for (let item of newData.infrastructure) {
            if (item.model) item.model = await safeTranslate(item.model);
          }
        }

        // 3. Cenários de Teste
        for (let test of newData.tests) {
          test.scenario = await safeTranslate(test.scenario);
          test.description = await safeTranslate(test.description);
          test.expectedResult = await safeTranslate(test.expectedResult);
          test.actualResult = await safeTranslate(test.actualResult);

          // 4. Blocos dentro do Teste
          if (test.blocks && test.blocks.length > 0) {
            for (let block of test.blocks) {
              // Traduz conteúdo se não for imagem ou código (que são técnicos)
              if (block.type !== 'image' && block.type !== 'code' && block.content) {
                block.content = await safeTranslate(block.content);
              }
              
              // Traduz descrições/legendas (presentes em imagens e códigos)
              if (block.description) {
                block.description = await safeTranslate(block.description);
              }
              
              // Traduz itens de lista
              if (block.type === 'list' && block.items) {
                for (let item of block.items) {
                  item.text = await safeTranslate(item.text);
                }
              }
            }
          }
        }

        console.log("Tradução concluída com sucesso!");
        setReportData(newData);
        setLang(to); 
      } catch (err) {
        console.error("Erro crítico na tradução:", err);
        alert("Ocorreu um erro durante a tradução. Algum campo pode não ter sido processado.");
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
