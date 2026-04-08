export const templates = [
  {
    id: 'default',
    name: 'Relatório Técnico Padrão',
    description: 'Relatório padrão com marca d\'água de confidencialidade e dados do analista.',
    state: {
      isPublic: false,
      title: '',
      introduction: '',
      objectives: '',
      prerequisites: '',
      infrastructure: [
        { id: Date.now(), type: 'NONE', model: '', firmware: '' }
      ],
      tests: []
    }
  },
  {
    id: 'public',
    name: 'Relatório Técnico Publicável',
    description: 'Relatório limpo (sem marca d\'água ou dados sensíveis), ideal para compartilhamento externo.',
    state: {
      isPublic: true,
      title: '',
      introduction: '',
      objectives: '',
      prerequisites: '',
      infrastructure: [
        { id: Date.now(), type: 'NONE', model: '', firmware: '' }
      ],
      tests: []
    }
  }
];
