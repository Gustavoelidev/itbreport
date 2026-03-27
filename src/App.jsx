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

const App = () => {
  const previewRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lang, setLang] = useState('pt');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  useEffect(() => {
    // Check initial session
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
            qaName: profile.full_name || prev.qaName,
            role: profile.position || prev.role,
            department: profile.department || prev.department,
            email: session.user.email || prev.email
          }));
        } else {
          // Fallback to metadata if profile table isn't ready
          setReportData(prev => ({
            ...prev,
            qaName: session.user.user_metadata?.full_name || prev.qaName,
            role: session.user.user_metadata?.position || prev.role,
            department: session.user.user_metadata?.department || prev.department,
            email: session.user.email || prev.email
          }));
        }
      }
    };
    syncProfile();
  }, [session, setReportData]);

  const t = translations[lang];

  const handleApplyTemplate = (templateId) => {
    const template = templates.find(temp => temp.id === templateId);
    if (template && window.confirm(t.templates.confirmChange)) {
      setReportData(prev => ({
        ...prev,
        ...template.state,
        date: prev.date 
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
          alert("Aviso: Limite diário de tradução gratuita atingido. O conteúdo restante permanecerá no idioma original.");
        } else {
          console.error("Erro na tradução:", err);
          alert("Ocorreu um erro inesperado durante a tradução.");
        }
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
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        lang={lang}
        setLang={setLang}
        t={t}
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
            <EditorSidebar {...reportStateUtils} lang={lang} t={t} />
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
    </div>
  );
};

export default App;
