/**
 * Utilitário para compressão e redimensionamento de imagens no lado do cliente.
 * Ajuda a economizar espaço no localStorage e reduzir o uso de memória.
 */

/**
 * Comprime uma imagem File ou Blob.
 * 
 * @param {File|Blob} file - O arquivo de imagem original.
 * @param {number} maxWidth - Largura máxima permitida (default 1280px).
 * @param {number} maxHeight - Altura máxima permitida (default 1280px).
 * @param {number} quality - Qualidade da compressão JPEG (0.0 a 1.0).
 * @returns {Promise<string>} - Promise que resolve para a string Base64 da imagem comprimida.
 */
export const compressImage = (file, maxWidth = 1280, maxHeight = 1280, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        // Calcular novas dimensões mantendo o aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Exportar como JPEG comprimido
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      
      img.onerror = (err) => reject(err);
    };
    
    reader.onerror = (err) => reject(err);
  });
};
