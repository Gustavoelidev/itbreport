export const defaultReportState = {
  title: '',
  qaName: '',
  role: '',
  department: '',
  email: '',
  date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
  introduction: '',
  objectives: '',
  prerequisites: '',
  infrastructure: [
    { id: Date.now(), type: 'AP', model: '', firmware: '' }
  ],
  tests: []
};
