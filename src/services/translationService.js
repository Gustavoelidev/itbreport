/**
 * Serviço de tradução utilizando a API MyMemory (gratuita)
 * Adicionado suporte robusto para idiomas e tratamento de erros.
 */

export const translateText = async (text, from = 'pt', to = 'en') => {
  if (!text || text === undefined || String(text).trim() === '') return text;
  
  // Normalização de idiomas para a MyMemory
  const sourceLang = from === 'pt' ? 'pt-BR' : 'en-US';
  const targetLang = to === 'pt' ? 'pt-BR' : 'en-US';
  
  const query = encodeURIComponent(String(text).trim());
  const langPair = `${sourceLang}|${targetLang}`;
  
  // Adicionando um "de" (email fictício) para evitar limites mais rígidos da API gratuita
  const url = `https://api.mymemory.translated.net/get?q=${query}&langpair=${langPair}&de=qa_report_tool@intelbras.com.br`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    
    if (data.responseData && data.responseData.translatedText) {
      // MyMemory às vezes retorna o erro na string se o limite for excedido
      const result = data.responseData.translatedText;
      if (result.includes("MYMEMORY WARNING")) {
        console.warn("MyMemory API Limit Reached");
        return text;
      }
      return result;
    }
    
    return text;
  } catch (error) {
    console.error('Erro na tradução automática:', error);
    return text;
  }
};
