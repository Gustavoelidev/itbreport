export const defaultReportState = {
  title: '',
  qaName: '',
  role: '',
  department: '',
  email: '',
  date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
  introduction: '',
  introductionImages: [],
  objectives: '',
  objectivesImages: [],
  prerequisites: '',
  prerequisitesImages: [],
  topology: '',
  topologyImages: [],
  infrastructure: [
    { id: Date.now(), type: 'NONE', model: '', firmware: '' }
  ],
  tests: [],
  conclusion: '',
  conclusionImages: [],
  isPublic: false,
  customLabels: {
    introduction: '',
    objectives: '',
    prerequisites: '',
    infrastructure: '',
    testResults: '',
    conclusion: ''
  }
};
