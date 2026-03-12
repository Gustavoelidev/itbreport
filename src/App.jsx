import React, { useRef, useState } from 'react';
import Header from './components/layout/Header';
import EditorSidebar from './components/editor/EditorSidebar';
import DocumentPreview from './components/preview/DocumentPreview';
import LoadingOverlay from './components/layout/LoadingOverlay';
import { useReportData } from './hooks/useReportData';
import { generatePDF } from './services/exportPdf';
import { generateDOCX } from './services/exportDocx';
import { translations } from './constants/translations';

const App = () => {
  const previewRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lang, setLang] = useState('pt');
  
  const reportStateUtils = useReportData();
  const { reportData } = reportStateUtils;
  const t = translations[lang];

  const handleExportPDF = async () => {
    setIsExporting(true);
    await generatePDF(previewRef.current, reportData.title);
    setIsExporting(false);
  };

  const handleExportDOCX = async () => {
    setIsExporting(true);
    await generateDOCX(reportData);
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

      {isExporting && <LoadingOverlay />}
    </div>
  );
};

export default App;
