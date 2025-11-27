const API_BASE = import.meta.env.VITE_API_BASE;
let chatEndpointUnavailable = false;

const mockReply = (messages) => {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  const text = (lastUserMessage?.content || '').toLowerCase();

  if (text.includes('wifi') || text.includes('wi-fi') || text.includes('rede')) {
    return 'Vamos verificar sua conexão: 1) Confirme se o Wi-Fi está ativo; 2) Reinicie o roteador ou modem; 3) Teste outra rede. Se persistir, informe o SSID e os erros exibidos.';
  }
  if (text.includes('senha') || text.includes('acesso') || text.includes('login')) {
    return 'Para acesso ou senha: 1) Use o portal de redefinição; 2) Cheque se há bloqueio por tentativas; 3) Informe o sistema afetado (sem dados sensíveis).';
  }
  if (text.includes('impressora')) {
    return 'Para impressoras: 1) Verifique cabos e energia; 2) Veja se a fila está pausada; 3) Reinstale drivers; 4) Informe modelo e erro exibido.';
  }

  return 'Certo! Para ajudar, descreva o que acontece, quando começou, qual sistema/equipamento está envolvido e se há mensagem de erro.';
};

export async function chatWithAssistant(messages) {
  if (!API_BASE || chatEndpointUnavailable) {
    return Promise.resolve(mockReply(messages));
  }

  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (response.status === 404) {
      chatEndpointUnavailable = true;
      return mockReply(messages);
    }

    if (!response.ok) {
      return mockReply(messages);
    }

    const data = await response.json();
    const reply =
      data?.message ||
      data?.reply ||
      data?.content ||
      data?.choices?.[0]?.message?.content;

    return reply ? String(reply).trim() : mockReply(messages);
  } catch {
    return mockReply(messages);
  }
}

export function resetChatFallback() {
  chatEndpointUnavailable = false;
}
