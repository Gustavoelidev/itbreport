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
  },
  {
    id: 'wpro-report',
    name: 'Relatório de Teste WPRO',
    description: 'Template detalhado seguindo o padrão WPRO (Gabriel Dias).',
    state: {
      title: 'Test report: MCS – Data rate limit',
      introduction: 'Relatório focado em validação de performance e limites de MCS para produtos da linha KIT WOM / MiMo+.',
      objectives: 'Validate the MCS – Data rate limit and throughput consistency.',
      prerequisites: 'Topology: 2 Radios + 2 computers connected by LAN port + Iperf3 SW. Mode: Bridge. Frequency: 5G. Channel: 157.',
      infrastructure: [
        { id: 1, type: 'AP', model: 'KIT WOM 5A MIMO G2', firmware: 'APCPE.QM-1C.v7.8-Intelbras' },
        { id: 2, type: 'CPE', model: 'WOM 5A MiMo+', firmware: 'APCPE.QM-1C.v7.8-Intelbras' }
      ],
      tests: [
        {
          id: 1,
          scenario: 'TC-01: MIMO 2X2 MCS8(30)',
          description: 'Select MIMO 2X2 MCS8(30) in AP and CPE, and start the throughput test',
          status: 'Fail',
          expectedResult: 'The throughput should follow the data rate (MCS)',
          actualResult: 'The throughput cannot follow the data rate (MCS)',
          blocks: [
            { id: 1, type: 'step', content: 'Configure AP in Bridge Mode with Channel 157' },
            { id: 2, type: 'step', content: 'Set MCS to 8 in both rários' },
            { id: 3, type: 'subtopic', content: 'Observations & Technical Notes' }
          ]
        },
        {
          id: 2,
          scenario: 'TC-02: SISO 1X1 MCS0(15)',
          description: 'Select SISO 1X1 MCS0(15) in AP and CPE, and start the throughput test',
          status: 'Fail',
          expectedResult: 'The throughput should follow the data rate (MCS)',
          actualResult: 'The throughput cannot follow the data rate (MCS)',
          blocks: [
            { id: 1, type: 'step', content: 'Configure radios to SISO 1x1' },
            { id: 2, type: 'subtopic', content: 'Observations' }
          ]
        }
      ]
    }
  }
];
