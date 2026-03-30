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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [originalDataPtr, setOriginalDataPtr] = useState(null);
  
  // Modal State
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
    // Check initial session
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
  
  // Sync profile data with report data when session changes
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
          // Fallback to metadata if profile table isn't ready
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

        // Processo sequencial com tratamento de limite
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
        const resetState = JSON.parse(JSON.stringify(defaultReportState));
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

  useEffect(() => {
    const monthsPT = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const monthsEN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Sempre puxa a data de HOJE do sistema
    const today = new Date();
    const formattedPT = `${today.getDate()} de ${monthsPT[today.getMonth()]} de ${today.getFullYear()}`;
    const formattedEN = `${monthsEN[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

    const newDate = lang === 'pt' ? formattedPT : formattedEN;

    if (newDate !== reportData.date) {
      setReportData(prev => ({ ...prev, date: newDate }));
    }
  }, [lang, setReportData]);

  if (authLoading) return <SplashScreen />;
  if (!session) return <AuthScreen />;

  return (
    <div className="h-screen bg-[#f3f4f6] flex flex-col font-sans text-slate-800 overflow-hidden">
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
      />

      <div className="flex-1 flex overflow-hidden relative">
        <div 
          className="bg-white border-r border-gray-200 transition-all duration-500 ease-in-out overflow-hidden flex-shrink-0 z-20"
          style={{ width: sidebarWidth }}
        >
          <div className="w-full md:w-[420px] h-full overflow-y-auto">
            <EditorSidebar 
              {...reportStateUtils} 
              onClearData={handleResetReport} 
              lang={lang} 
              t={t} 
            />
          </div>
        </div>

        <main className={`flex-1 bg-slate-300 overflow-y-auto ${isMobile && sidebarOpen ? 'hidden' : 'p-4 md:p-12 flex'} flex-col items-center scroll-smooth relative z-0 transition-all duration-500 ease-in-out`}>
          <div className="w-full flex flex-col items-center pdf-pages-container">
            <DocumentPreview ref={previewRef} reportData={reportData} lang={lang} t={t} />
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
