import { faqAPI } from './api';

const localFaq = [
  {
    id: 'faq-acesso-redefinir-senha',
    title: 'Como redefinir minha senha de rede/AD',
    category: 'Acesso',
    content:
      'Passo a passo para recuperar acesso:\n' +
      '1) Conecte-se na rede corporativa (ou VPN) e pressione Ctrl+Alt+Del no Windows.\n' +
      '2) Selecione "Alterar uma senha" e informe a senha atual e a nova senha.\n' +
      '3) Use uma senha forte: mínimo 8 caracteres com maiúsculas, minúsculas, número e símbolo.\n' +
      '4) Após alterar, bloqueie (Win+L) e desbloqueie o computador para replicar no domínio.\n' +
      '5) Se aparecer bloqueio, aguarde 15 minutos e tente de novo. Persistindo, abra chamado com print do erro.',
    tags: ['senha', 'bloqueio', 'login'],
    lastUpdated: '2024-06-10',
  },
  {
    id: 'faq-rede-sem-internet',
    title: 'Sem internet no Wi-Fi da empresa',
    category: 'Rede',
    content:
      'Checklist rápido de rede:\n' +
      '1) Confirme Wi-Fi ligado e modo avião desligado. Reconecte à rede corporativa.\n' +
      '2) Em home office, reinicie o roteador e o computador. Teste outra rede (ex.: hotspot).\n' +
      '3) Esqueça a rede e refaça o login com usuário/senha corretos; confirme se a VPN não está bloqueando.\n' +
      '4) No Windows, rode "Solucionar problemas de rede" e verifique se há proxy configurado.\n' +
      '5) Sem sucesso: anote SSID, mensagem exibida, hora do teste e abra um chamado.',
    tags: ['wifi', 'rede', 'vpn'],
    lastUpdated: '2024-05-02',
  },
  {
    id: 'faq-windows-lento',
    title: 'Windows lento ou travando',
    category: 'Software',
    content:
      'Como melhorar o desempenho:\n' +
      '1) Reinicie o equipamento e feche apps pesados no Gerenciador de Tarefas (CPU/Memória/Disco altos).\n' +
      '2) Desative inicialização automática de programas não essenciais (Gerenciador de Tarefas > Inicializar).\n' +
      '3) Limpe arquivos temporários e garanta pelo menos 10 GB livres em disco.\n' +
      '4) Instale atualizações pendentes do Windows e do antivírus, depois reinicie novamente.\n' +
      '5) Se continuar lento, registre hora, app afetado, prints do uso de recursos e abra chamado.',
    tags: ['windows', 'desempenho'],
    lastUpdated: '2024-04-18',
  },
  {
    id: 'faq-impressora-nao-imprime',
    title: 'Impressora não imprime',
    category: 'Hardware',
    content:
      'Verificações para voltar a imprimir:\n' +
      '1) Confirme energia, cabos, papel e insumos (tinta/toner). Veja se há alertas no visor.\n' +
      '2) Abra a fila de impressão: limpe trabalhos travados e confirme que não está pausada.\n' +
      '3) Imprima uma página de teste. Se falhar, reinstale/atualize o driver da impressora.\n' +
      '4) Teste a impressora em outro computador ou conecte outra impressora ao seu para isolar o problema.\n' +
      '5) Ainda sem imprimir? Informe modelo, IP (se houver), cabo usado e a mensagem de erro ao suporte.',
    tags: ['impressora', 'hardware'],
    lastUpdated: '2024-03-05',
  },
];

const ensureArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  if (payload?.items && Array.isArray(payload.items)) return payload.items;
  return [];
};

export async function getFaqArticles() {
  try {
    const data = await faqAPI.getAll();
    const normalized = ensureArray(data);
    return normalized.length ? normalized : localFaq;
  } catch {
    return localFaq;
  }
}

export async function getPopularFaqArticles() {
  try {
    const data = await faqAPI.getPopular();
    const normalized = ensureArray(data);
    if (normalized.length) return normalized;
    return localFaq.slice(0, 2);
  } catch {
    return localFaq.slice(0, 2);
  }
}

export async function sendFaqFeedback(id, payload) {
  try {
    return await faqAPI.addFeedback(id, payload);
  } catch (error) {
    console.warn('Não foi possível registrar o feedback do FAQ:', error);
    throw error;
  }
}

export const faqFallback = localFaq;
