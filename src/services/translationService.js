/**
 * Serviço de tradução utilizando a API MyMemory (gratuita)
 */

export const translateText = async (text, from = 'pt', to = 'en') => {
  // Se for nulo, apenas espaço ou muito curto, não traduz para poupar API
  if (!text || String(text).trim() === '') return text;
  if (String(text).length < 2 && !/^[a-zA-Z0-9]$/.test(text)) return text;
  
  const sourceLang = from === 'pt' ? 'pt-BR' : 'en-US';
  const targetLang = to === 'pt' ? 'pt-BR' : 'en-US';
  
  // MyMemory separa pares por barra vertical |
  const langPair = `${from}|${to}`;
  const query = encodeURIComponent(String(text).trim());
  
  // Usamos um e-mail fake de contato para aumentar levemente o limite da API gratuita
  const url = `https://api.mymemory.translated.net/get?q=${query}&langpair=${langPair}&de=qa_reporting_tool_intelbras@gmail.com`;

  try {
    console.log(`[Traduzindo] (${from} -> ${to}): "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Falha na rede');
    
    const data = await response.json();
    
    if (data.responseData && data.responseData.translatedText) {
      const translated = data.responseData.translatedText;
      
      // Verifica se a API retornou um erro em forma de string (comum na MyMemory)
      if (translated.includes("MYMEMORY WARNING")) {
          console.warn("Limite da API MyMemory atingido.");
          return "LIMIT_EXCEEDED"; 
      }
      
      return translated;
    }
    
    return text;
  } catch (error) {
    console.error('Erro ao traduzir trecho:', error);
    return text;
  }
};
