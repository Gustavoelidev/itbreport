export const templates = [
  {
    id: 'default',
    name: 'Relatório Técnico Padrão',
    description: 'Relatório completo com infraestrutura e múltiplos cenários.',
    state: {
      title: 'Relatório de Testes de Software',
      introduction: 'O presente documento descreve os resultados dos testes realizados no sistema...',
      objectives: 'Validar a estabilidade e performance das novas funcionalidades implementadas.',
      prerequisites: 'Ambiente de laboratório controlado, conexão estável e dispositivos configurados.',
      infrastructure: [
        { id: 1, type: 'AP', model: 'RG-RAP6262', firmware: '3.0.1.r' },
        { id: 2, type: 'SWITCH', model: 'RG-NBS3100', firmware: '2.0.1' }
      ],
      tests: [
        {
          id: 1,
          scenario: 'Acesso ao Portal',
          description: 'Verificar se o usuário consegue logar corretamente.',
          status: 'Pass',
          expectedResult: 'Usuário logado com sucesso.',
          actualResult: '',
          blocks: [
            { id: 1, type: 'step', content: 'Abrir o navegador no endereço 192.168.1.1' },
            { id: 2, type: 'step', content: 'Digitar usuário e senha padrão admin/admin' }
          ]
        }
      ]
    }
  }
];
