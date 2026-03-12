/**
 * Serviço de tradução utilizando a API MyMemory (gratuita até 1000 palavras/dia sem chave)
 */

export const translateText = async (text, from = 'pt', to = 'en') => {
  if (!text || text.trim() === '') return text;
  
  // Limpa o texto para evitar problemas na URL
  const query = encodeURIComponent(text);
  const langPair = `${from}|${to}`;
  const url = `https://api.mymemory.translated.net/get?q=${query}&langpair=${langPair}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.responseData && data.responseData.translatedText) {
      // Retorna a tradução ou o original se a tradução for igual
      return data.responseData.translatedText;
    }
    return text;
  } catch (error) {
    console.error('Erro na tradução automática:', error);
    return text;
  }
};
