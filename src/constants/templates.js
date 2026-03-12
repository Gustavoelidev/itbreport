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
  },
  {
    id: 'performance',
    name: 'Teste de Performance / Stress',
    description: 'Focado em throughput e latência.',
    state: {
      title: 'Relatório de Estresse de Rede',
      introduction: 'Este teste visa identificar o limite de carga suportado pelos dispositivos...',
      objectives: 'Mensurar o throughput real em condições de alta densidade.',
      prerequisites: 'Servidor Iperf3 configurado e 50 clientes simulados.',
      infrastructure: [
        { id: 1, type: 'STATION', model: 'Client Simulator v2', firmware: '-' }
      ],
      tests: [
        {
          id: 1,
          scenario: 'Throughput Nominal',
          description: 'Carga de 10Gbps constante por 60 minutos.',
          status: 'Pass',
          expectedResult: 'Sem queda de pacotes e latência abaixo de 5ms.',
          actualResult: '',
          blocks: [
            { id: 1, type: 'code', content: 'iperf3 -c 192.168.1.10 -t 3600 -p 5201', description: 'Comando executado no servidor' },
            { id: 2, type: 'subtopic', content: 'Métricas de Latência' }
          ]
        }
      ]
    }
  },
  {
    id: 'certification',
    name: 'Certificação de Produto',
    description: 'Checklist simplificado para homologação.',
    state: {
      title: 'Checklist de Homologação',
      introduction: 'Avaliação rápida de conformidade com os requisitos da marca.',
      objectives: 'Verificar itens básicos de hardware e software.',
      prerequisites: 'Produto em versão final de produção.',
      infrastructure: [],
      tests: [
        {
          id: 1,
          scenario: 'Inspeção Visual e Embalagem',
          description: 'Verificar logotipos e manuais.',
          status: 'Pass',
          expectedResult: 'Tudo de acordo com o guia de marca.',
          actualResult: '',
          blocks: [
            { id: 1, type: 'list', listType: 'bullet', items: [
              { id: 1, text: 'Logo Intelbras centralizado' },
              { id: 2, text: 'QR Code de configuração funcionando' }
            ]}
          ]
        }
      ]
    }
  }
];
