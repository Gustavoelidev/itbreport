import React, { useRef, useState, useEffect } from 'react';
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
import { supabase } from './lib/supabase';
import AuthScreen from './components/auth/AuthScreen';
import SplashScreen from './components/auth/SplashScreen';
import { defaultReportState } from './constants/defaultReportState';
import IntelbrasModal from './components/ui/IntelbrasModal';

const App = () => {
  const previewRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lang, setLang] = useState('pt');
  const [zoom, setZoom] = useState(100);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [originalDataPtr, setOriginalDataPtr] = useState(null);
  
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    confirmText: 'Confirmar',
    cancelText: 'Cancelar'
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const showAlert = (title, message) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      onConfirm: closeModal,
      onCancel: null,
      confirmText: 'OK'
    });
  };

  const showConfirm = (title, message, onConfirm, onCancel = closeModal) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      onConfirm: () => { onConfirm(); closeModal(); },
      onCancel: () => { if (onCancel) onCancel(); closeModal(); },
      confirmText: 'Confirmar',
      cancelText: 'Cancelar'
    });
  };
  
  const handleSetLang = (newLang) => {
    if (newLang === 'pt' && lang === 'en' && originalDataPtr) {
      setReportData(originalDataPtr);
      setOriginalDataPtr(null);
    }
    setLang(newLang);
  };

  useEffect(() => {
    if (localStorage.getItem('temp_auth_user') && !sessionStorage.getItem('session_active')) {
      supabase.auth.signOut().then(() => {
        localStorage.removeItem('temp_auth_user');
      });
    } else if (localStorage.getItem('temp_auth_user')) {
      sessionStorage.setItem('session_active', 'true');
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const sidebarWidth = sidebarOpen ? (isMobile ? '100vw' : '420px') : '0';
  
  const reportStateUtils = useReportData();
  const { reportData, setReportData } = reportStateUtils;
  
  useEffect(() => {
    const syncProfile = async () => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setReportData(prev => ({
            ...prev,
            qaName: prev.qaName || profile.full_name,
            role: prev.role || profile.position,
            department: prev.department || profile.department,
            email: prev.email || session.user.email
          }));
        } else {
          setReportData(prev => ({
            ...prev,
            qaName: prev.qaName || session.user.user_metadata?.full_name,
            role: prev.role || session.user.user_metadata?.position,
            department: prev.department || session.user.user_metadata?.department,
            email: prev.email || session.user.email
          }));
        }
      }
    };
    syncProfile();
  }, [session, setReportData]);

  const t = translations[lang];

  const handleApplyTemplate = (templateId) => {
    const template = templates.find(temp => temp.id === templateId);
    if (template) {
      showConfirm(
        t.templates.title,
        t.templates.confirmChange,
        () => {
          setReportData(prev => ({
            ...prev,
            ...template.state,
            date: prev.date 
          }));
        }
      );
    }
  };

  const handleAutoTranslateReport = async () => {
    if (!reportData || !reportData.tests) return;
    
    showConfirm(
      t.translations.autoTranslate,
      t.translations.confirmTranslate,
      async () => {
        setIsTranslating(true);
        const from = lang === 'pt' ? 'pt' : 'en';
        const to = lang === 'pt' ? 'en' : 'pt';

        try {
        if (from === 'pt') {
          setOriginalDataPtr(JSON.parse(JSON.stringify(reportData)));
        }

        const newData = JSON.parse(JSON.stringify(reportData));
        
        const safeTranslate = async (txt) => {
          if (!txt || String(txt).trim() === '') return txt;
          const res = await translateText(txt, from, to);
          if (res === "LIMIT_EXCEEDED") throw new Error("LIMIT_EXCEEDED");
          await new Promise(r => setTimeout(r, 100)); 
          return res;
        };

        newData.title = await safeTranslate(newData.title);
        newData.qaName = await safeTranslate(newData.qaName);
        newData.role = await safeTranslate(newData.role);
        newData.department = await safeTranslate(newData.department);
        newData.introduction = await safeTranslate(newData.introduction);
        newData.objectives = await safeTranslate(newData.objectives);
        newData.prerequisites = await safeTranslate(newData.prerequisites);

        if (newData.infrastructure) {
          for (let item of newData.infrastructure) {
            if (item.model) item.model = await safeTranslate(item.model);
          }
        }

        for (let test of newData.tests) {
          test.scenario = await safeTranslate(test.scenario);
          test.description = await safeTranslate(test.description);
          test.expectedResult = await safeTranslate(test.expectedResult);
          test.actualResult = await safeTranslate(test.actualResult);

          if (test.blocks) {
            for (let block of test.blocks) {
              if (block.type !== 'image' && block.type !== 'code' && block.content) {
                block.content = await safeTranslate(block.content);
              }
              if (block.description) {
                block.description = await safeTranslate(block.description);
              }
              if (block.type === 'list' && block.items) {
                for (let item of block.items) {
                  item.text = await safeTranslate(item.text);
                }
              }
            }
          }
        }

        setReportData(newData);
        setLang(to); 
      } catch (err) {
        if (err.message === "LIMIT_EXCEEDED") {
          showAlert(t.translations.autoTranslate, "Aviso: Limite diário de tradução gratuita atingido. O conteúdo restante permanecerá no idioma original.");
        } else {
          console.error("Erro na tradução:", err);
          showAlert(t.translations.autoTranslate, "Ocorreu um erro inesperado durante a tradução.");
        }
      } finally {
        setIsTranslating(false);
      }
    }
  );
};

  const handleResetReport = () => {
    showConfirm(
      "Limpar Relatório",
      "Atenção: Todos os dados não salvos deste relatório serão descartados. Tem certeza que deseja LIMPAR TUDO?",
      () => {
        const currentIsPublic = reportData.isPublic;
        const resetState = JSON.parse(JSON.stringify(defaultReportState));
        resetState.isPublic = currentIsPublic;
        
        if (session?.user) {
          resetState.qaName = reportData.qaName;
          resetState.role = reportData.role;
          resetState.department = reportData.department;
          resetState.email = reportData.email;
        }
        setReportData(resetState);
        setOriginalDataPtr(null);
      }
    );
  };

  const handleExportPDF = () => {
    generatePDF(reportData.title);
  };

  const handleExportDOCX = async () => {
    setIsExporting(true);
    setTimeout(async () => {
      await generateDOCX(reportData, t);
      setIsExporting(false);
    }, 100);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const filename = reportData.title ? `${reportData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json` : 'report.json';
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportJSON = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData && importedData.title !== undefined) {
          setReportData(importedData);
          showAlert("Sucesso", "Projeto carregado com sucesso!");
        } else {
          showAlert("Erro", "Arquivo JSON inválido.");
        }
      } catch (error) {
        showAlert("Erro", "Erro ao ler o arquivo JSON.");
      }
    };
    reader.readAsText(file);
  };


  if (authLoading) return <SplashScreen />;
  if (!session) return <AuthScreen />;

  return (
    <div className={`bg-[#f3f4f6] flex flex-col font-sans text-slate-800 ${isExporting ? 'min-h-screen' : 'h-screen overflow-hidden'}`}>
      <Header 
        onExportDOCX={handleExportDOCX} 
        onExportPDF={handleExportPDF} 
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        lang={lang}
        setLang={handleSetLang}
        t={t}
        onClearData={handleResetReport}
        onApplyTemplate={handleApplyTemplate}
        onAutoTranslate={handleAutoTranslateReport}
        isTranslating={isTranslating}
        user={session.user}
        isPublic={reportData.isPublic}
        onTogglePublic={(val) => handleInputChange({ target: { value: val } }, 'isPublic')}
      />

      <div className={`flex-1 flex relative print:block ${isExporting ? '' : 'overflow-hidden'}`}>
        <div 
          className="bg-white border-r border-gray-200 transition-all duration-500 ease-in-out flex-shrink-0 z-20 print:hidden"
          style={{ width: sidebarWidth, overflow: isExporting ? 'visible' : 'hidden' }}
        >
          <div className="w-full md:w-[420px] h-full overflow-y-auto">
            <EditorSidebar 
              {...reportStateUtils} 
              onClearData={handleResetReport} 
              onApplyTemplate={handleApplyTemplate}
              lang={lang} 
              t={t} 
            />
          </div>
        </div>

        <main className={`flex-1 bg-slate-300 flex-col items-center scroll-smooth relative z-0 transition-all duration-500 ease-in-out ${isMobile && sidebarOpen ? 'hidden' : 'flex'} ${isExporting ? 'overflow-visible py-12' : 'overflow-y-auto p-4 md:p-12'}`}>
          <div
            className="w-full flex flex-col items-center pdf-pages-container"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            <DocumentPreview ref={previewRef} reportData={reportData} lang={lang} t={t} />
          </div>

          {/* Controles de Zoom */}
          <div className="fixed bottom-6 right-6 flex items-center gap-1 bg-white rounded-full shadow-lg border border-gray-200 px-2 py-1 z-50 print:hidden">
            <button
              onClick={() => setZoom(z => Math.max(50, z - 10))}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 font-bold text-lg leading-none"
              title="Diminuir zoom"
            >−</button>
            <span className="text-[11px] font-bold text-gray-500 w-10 text-center select-none">{zoom}%</span>
            <button
              onClick={() => setZoom(z => Math.min(150, z + 10))}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 font-bold text-lg leading-none"
              title="Aumentar zoom"
            >+</button>
          </div>
        </main>
      </div>

      {(isExporting || isTranslating) && (
        <LoadingOverlay 
          message={isTranslating ? t.translations.translating : undefined} 
        />
      )}

      <IntelbrasModal 
        {...modalConfig} 
        onClose={closeModal} 
      />
    </div>
  );
};

export default App;
