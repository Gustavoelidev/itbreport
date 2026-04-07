/**
 * Serviço responsável por conectar-se ao provedor de tradução externo (MyMemory).
 * Lida com limites de requisições e casos de inputs vazios ou simbólicos para preservar a cota.
 * 
 * @param {string} text - O texto de entrada a ser traduzido.
 * @param {string} [from='pt'] - Código de idioma de origem.
 * @param {string} [to='en'] - Código de idioma de destino.
 * @returns {Promise<string>} A string traduzida, ou o texto original em caso de falha/limite de cota.
 */
export const translateText = async (text, from = 'pt', to = 'en') => {
  if (!text || String(text).trim() === '') return text;
  if (String(text).length < 2 && !/^[a-zA-Z0-9]$/.test(text)) return text;

  const sourceLang = from === 'pt' ? 'pt-BR' : 'en-US';
  const targetLang = to === 'pt' ? 'pt-BR' : 'en-US';

  const langPair = `${from}|${to}`;
  const query = encodeURIComponent(String(text).trim());
  const url = `https://api.mymemory.translated.net/get?q=${query}&langpair=${langPair}&de=qa_reporting_tool_yrd@gmail.com`;

  try {
    console.log(`[Traduzindo] (${from} -> ${to}): "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);

    const response = await fetch(url);
    if (!response.ok) throw new Error('Falha na rede');

    const data = await response.json();

    if (data.responseData && data.responseData.translatedText) {
      const translated = data.responseData.translatedText;

      if (translated.includes("MYMEMORY WARNING")) {
        console.warn("[TranslationService] Quota limit reached.");
        return "LIMIT_EXCEEDED";
      }

      return translated;
    }

    return text;
  } catch (error) {
    console.error('[TranslationService] Error processing text:', error);
    return text;
  }
};
