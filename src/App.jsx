import React, { useRef, useState, useEffect } from 'react';
import Header from './components/layout/Header';
import EditorSidebar from './components/editor/EditorSidebar';
import DocumentPreview from './components/preview/DocumentPreview';
import LoadingOverlay from './components/layout/LoadingOverlay';
import { useReportData } from './hooks/useReportData';
import { generatePDF } from './services/exportPdf';
import { generateDOCX } from './services/exportDocx';

const App = () => {
  const previewRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const reportStateUtils = useReportData();
  const { reportData } = reportStateUtils;



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
      <Header onExportDOCX={handleExportDOCX} onExportPDF={handleExportPDF} />

      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar {...reportStateUtils} />

        <main className="flex-1 bg-gray-200 overflow-y-auto p-12 flex justify-center items-start scroll-smooth z-0">
          <DocumentPreview ref={previewRef} reportData={reportData} />
        </main>
      </div>

      {isExporting && <LoadingOverlay />}
    </div>
  );
};

export default App;
