export const generatePDF = (title) => {
  const originalTitle = document.title;
  document.title = (title || 'report').replace(/[^a-z0-9]/gi, '_');
  window.print();
  document.title = originalTitle;
};
