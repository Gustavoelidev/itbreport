/**
 * Serviço de tradução utilizando a API MyMemory (gratuita)
 * Otimizado para estabilidade e compatibilidade.
 */

export const translateText = async (text, from = 'pt', to = 'en') => {
  if (!text || String(text).trim() === '' || String(text).length < 2) return text;
  
  // Limpeza básica para evitar poluir a tradução com tags markdown de negrito
  const cleanText = String(text).replace(/\*\*/g, '');
  
  const query = encodeURIComponent(cleanText.trim());
  const url = `https://api.mymemory.translated.net/get?q=${query}&langpair=${from}|${to}&de=qa_report_tool@intelbras.com.br`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.responseData && data.responseData.translatedText) {
      let result = data.responseData.translatedText;
      
      // Se a MyMemory avisar de limite, retornamos o original sem erro
      if (result.includes("MYMEMORY WARNING")) {
        return text;
      }

      // Se o texto original tinha negrito, tentamos sugerir ou apenas retornamos o limpo
      // (Manter negrito em tradução dinâmica é complexo, priorisamos o texto)
      return result;
    }
    
    return text;
  } catch (error) {
    console.error('Falha na API de Tradução:', error);
    return text;
  }
};
