import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MobileMenu } from '@/components/MobileMenu';
import UserSidebar from './components/UserSidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ticketsAPI, ticketMessagesAPI } from '@/services/api';
import { chatWithAssistant } from '@/services/chat';

const initialBotMessage = {
  id: 'w1',
  sender: 'bot',
  text:
    'Bem-vindo ao HelpLine! Este canal faz a triagem inicial. Suas informações serão tratadas conforme a LGPD (Lei 13.709/2018). Ao continuar, você concorda com o uso dos dados para atendimento técnico.',
};

const quickReplies = [
  'Problemas de rede (Wi-Fi/VPN)',
  'Acesso e senha (conta bloqueada)',
  'Sistema lento ou travando',
  'Erro ao abrir sistema X',
  'Impressora não imprime',
];

const categoryOptions = [
  { value: 'Hardware', label: '1 - Hardware' },
  { value: 'Software', label: '2 - Software' },
  { value: 'Rede', label: '3 - Rede' },
  { value: 'Acesso/Security', label: '4 - Acesso/Security' },
  { value: 'Impressora', label: '5 - Impressora' },
  { value: 'Sistema Operacional', label: '6 - Sistema Operacional' },
  { value: 'Outros', label: '7 - Outros' },
];

const categoryGuides = {
  Hardware: [
    'Confira cabos e energia e reinicie o equipamento, se possível.',
    'Informe o modelo ou a etiqueta patrimonial.',
    'Observe ruídos, apitos ou luzes piscando fora do normal.',
  ],
  Software: [
    'Qual sistema/aplicativo apresentou o erro e qual tarefa fazia?',
    'O problema começou após atualização? Informe a versão.',
    'Envie a mensagem exibida (print ou texto).',
  ],
  Rede: [
    'Teste outro cabo/SSID ou conecte via VPN.',
    'Verifique se outras pessoas também estão sem rede.',
    'Informe SSID/ponto de rede e onde você está.',
  ],
  'Acesso/Security': [
    'Qual portal ou sistema está bloqueando o acesso?',
    'Houve troca de senha ou alteração de MFA recentemente?',
    'Existe mensagem de erro ou bloqueio? Copie o texto.',
  ],
  Impressora: [
    'Qual o modelo e se está conectada via cabo ou Wi-Fi?',
    'Há papel/toner e o equipamento está sem atolamentos?',
    'O painel mostra algum aviso ou código?',
  ],
  'Sistema Operacional': [
    'Qual Windows/macOS e se aparece tela azul ou código?',
    'Ocorre após atualização/instalação recente?',
    'CPU ou disco chegam a 100%? O equipamento congela totalmente?',
  ],
  Outros: [
    'Conte o que mudou antes do problema começar.',
    'Indique sistemas e equipamentos envolvidos.',
    'Há impacto em outras pessoas? Qual mensagem aparece?',
  ],
};

const categoryQuestions = {
  Hardware: 'Qual equipamento está com problema e o que já foi testado?',
  Software: 'Qual sistema ou aplicação e em que etapa ocorre o erro?',
  Rede: 'Onde você está conectado (SSID/ponto de rede) e desde quando ocorre?',
  'Acesso/Security': 'Qual sistema/portal bloqueia o acesso e que mensagem aparece?',
  Impressora: 'Qual o modelo da impressora e se outros usuários conseguem imprimir?',
  'Sistema Operacional': 'Existe algum código/tela azul? O problema ocorre após alguma ação específica?',
  Outros: 'Descreva detalhadamente o cenário para direcionarmos corretamente.',
};

const categoryActionPlans = {
  Hardware: [
    {
      intro: 'Vamos revisar rapidamente o hardware:',
      steps: [
        'Confirme cabos de energia/dados e teste outra tomada ou cabo, se possível.',
        'Reinicie o equipamento e observe luzes, ruídos ou mensagens incomuns.',
        'Fotografe ou informe o patrimônio/modelo para registro.',
      ],
      reminder: 'Se algum componente esquentar demais ou emitir cheiro, desligue e avise imediatamente.',
      closing: 'Essas verificações ajudam a diagnosticar se é falha física. Resolvido?',
    },
    {
      intro: 'Beleza, vamos aprofundar:',
      steps: [
        'Atualize BIOS e drivers críticos via site do fabricante ou gestor de dispositivos.',
        'Rode diagnósticos rápidos (MemTest, verificação de disco, ventilação) e registre códigos.',
        'Informe se há antivírus escaneando ou softwares iniciando junto com o Windows.',
      ],
      reminder: 'Se detectar ruído mecânico ou superaquecimento, mantenha desligado e abra chamado imediatamente.',
      closing: 'Depois desses testes avançados, o desempenho melhorou?',
    },
  ],
  Software: [
    {
      intro: 'Vamos validar o software:',
      steps: [
        'Informe a versão do sistema/aplicativo e se houve atualização recente.',
        'Faça logoff/login novamente e limpe caches/arquivos temporários, quando aplicável.',
        'Registre a mensagem exibida (print ou texto) e o horário aproximado.',
      ],
      reminder: 'Caso o erro ocorra só em você, preciso do seu usuário/login e da tarefa que fazia.',
      closing: 'Após esses passos, o sistema voltou a funcionar?',
    },
    {
      intro: 'Vamos tentar outra abordagem:',
      steps: [
        'Repare/instale novamente o aplicativo ou utilize modo seguro para comparar o comportamento.',
        'Liberte espaço em disco (mínimo 10%) e finalize processos em segundo plano que travem o app.',
        'Informe logs/eventos (Visualizador do Windows ou console) com horário e código de falha.',
      ],
      reminder: 'Se houver integração com outros sistemas, valide se eles também apresentam alerta.',
      closing: 'Com essas ações extras, o erro desapareceu?',
    },
  ],
  Rede: [
    {
      intro: 'Vamos revisar sua conexão de rede:',
      steps: [
        'Confirme se o Wi-Fi ou cabo está conectado e selecione o SSID correto.',
        'Teste outro cabo ou, se estiver remoto, tente a VPN corporativa.',
        'Reinicie modem/roteador (se puder) e verifique se colegas também estão sem conexão.',
        'Anote SSID/ponto de rede, local e mensagens exibidas.',
      ],
      reminder: 'Informe também se a falha ocorre apenas em um equipamento ou em vários.',
      closing: 'Após essas etapas, a conexão voltou?',
    },
    {
      intro: 'Vamos detalhar mais um pouco:',
      steps: [
        'Execute ping para o gateway e para 8.8.8.8 e informe latência/perdas.',
        'Se estiver via VPN, desconecte e conecte novamente, testando outro túnel se existir.',
        'Atualize drivers de placa de rede e verifique políticas de proxy/firewall aplicadas.',
      ],
      reminder: 'Anote horário das quedas para conferirmos nos logs dos equipamentos.',
      closing: 'Depois desses testes, a rede estabilizou?',
    },
  ],
  'Acesso/Security': [
    {
      intro: 'Vamos liberar seu acesso:',
      steps: [
        'Confira se a senha expirou e se houve troca recente.',
        'Valide se o MFA/2FA está funcionando (token, SMS ou app autenticador).',
        'Copie a mensagem de bloqueio/erro exibida para registro.',
      ],
      reminder: 'Se houver bloqueio por tentativas, aguarde 15 minutos e teste novamente antes de avisar.',
      closing: 'Depois disso, conseguiu acessar?',
    },
    {
      intro: 'Vamos seguir para validações avançadas:',
      steps: [
        'Tente acessar em outro navegador/dispositivo para descartar cache local.',
        'Solicite desbloqueio temporário ou reset de MFA no portal de identidade, se disponível.',
        'Informe IP, horário e sistema/portal para conferirmos nos logs de segurança.',
      ],
      reminder: 'Se recebeu alerta de segurança, encaminhe o e-mail/print ao suporte.',
      closing: 'Após esses passos extras, o acesso foi liberado?',
    },
  ],
  Impressora: [
    {
      intro: 'Vamos checar a impressora:',
      steps: [
        'Confirme se há papel e toner e se não existe atolamento.',
        'Reinicie impressora e computador e teste uma página de diagnóstico.',
        'Verifique se outros usuários conseguem imprimir no mesmo equipamento.',
      ],
      reminder: 'Informe o modelo, se é compartilhada e se usa cabo ou Wi-Fi.',
      closing: 'A impressão voltou a funcionar?',
    },
    {
      intro: 'Seguimos com validações adicionais:',
      steps: [
        'Reinstale o driver/impressora, preferindo o driver universal ou específico atualizado.',
        'Teste outra fila/porta (USB x rede) e informe IP/hostname configurado.',
        'Cheque se há jobs travados no spooler do servidor ou da estação.',
      ],
      reminder: 'Se houver mensagem no painel, descreva exatamente o código apresentado.',
      closing: 'Após essas verificações extras, a impressora respondeu?',
    },
  ],
  'Sistema Operacional': [
    {
      intro: 'Vamos revisar o sistema operacional:',
      steps: [
        'Informe a versão do Windows/macOS e se houve atualização recente.',
        'Verifique no Gerenciador de Tarefas/Monitor se CPU ou disco chegam a 100%.',
        'Registre telas azuis, códigos de erro e horários aproximados.',
      ],
      reminder: 'Se houver dispositivo recém-instalado, desconecte e teste novamente.',
      closing: 'Depois dos ajustes, o equipamento estabilizou?',
    },
    {
      intro: 'Vamos aplicar etapas avançadas:',
      steps: [
        'Execute verificações `sfc /scannow` e `DISM /Online /Cleanup-Image /RestoreHealth` (Windows) ou Prime Aid (macOS).',
        'Desative itens de inicialização não essenciais e observe o tempo de boot.',
        'Analise o Visualizador de Eventos/Console para citar IDs de erro recorrentes.',
      ],
      reminder: 'Se persistir, informe se podemos agendar manutenção remota ou presencial.',
      closing: 'Após esses reparos, o SO segue instável?',
    },
  ],
  Outros: [
    {
      intro: 'Vamos entender melhor o cenário:',
      steps: [
        'Detalhe o que estava fazendo quando tudo começou.',
        'Informe sistemas/equipamentos envolvidos e se há impacto em outras pessoas.',
        'Compartilhe prints ou mensagens de erro relevantes.',
      ],
      reminder: 'Quanto mais contexto, mais rápido conseguimos resolver ou encaminhar.',
      closing: 'Com essas informações, conseguiu avançar?',
    },
    {
      intro: 'Vou preparar uma segunda abordagem:',
      steps: [
        'Liste as tentativas já feitas e resultados obtidos.',
        'Teste em outro equipamento/perfil para comparar.',
        'Informe se existe prazo crítico ou operação parada por conta do problema.',
      ],
      reminder: 'Esses dados nos ajudam a priorizar e direcionar o analista certo.',
      closing: 'Após os testes adicionais, a situação melhorou?',
    },
  ],
};

const bubbleClass = (sender) => {
  if (sender === 'user') {
    return 'bg-[#4D63F4] text-white border-transparent shadow-lg';
  }
  if (sender === 'system') {
    return 'bg-amber-50 text-amber-900 border border-amber-200';
  }
  return 'bg-slate-100 text-slate-900 border border-slate-200';
};

const buildContentBlocks = (text) => {
  const blocks = [];
  let paragraph = [];
  let listItems = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: 'p', text: paragraph.join(' ') });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: 'ol', items: [...listItems] });
      listItems = [];
    }
  };

  text.split('\n').forEach((raw) => {
    const line = raw.trim();
    if (!line) return;
    const match = line.match(/^(\d+)\)\s*(.+)$/);
    if (match) {
      flushParagraph();
      listItems.push(match[2]);
    } else {
      flushList();
      paragraph.push(line);
    }
  });

  flushParagraph();
  flushList();

  if (!blocks.length) return [{ type: 'p', text }];
  return blocks;
};

const renderMessageContent = (text) =>
  buildContentBlocks(text).map((block, idx) => {
    if (block.type === 'ol') {
      return (
        <ol key={`list-${idx}`} className="list-decimal pl-5 space-y-1 text-[17px] sm:text-lg text-current">
          {block.items.map((item, itemIdx) => (
            <li key={`list-${idx}-${itemIdx}`}>{item}</li>
          ))}
        </ol>
      );
    }

    return (
      <p key={`p-${idx}`} className="text-[17px] sm:text-lg leading-relaxed text-current">
        {block.text}
      </p>
    );
  });

const composeGuidedPlan = (category, userText, planIndex) => {
  if (!category) return null;
  const plans = categoryActionPlans[category] || categoryActionPlans.Outros;
  if (!plans || planIndex >= plans.length) return null;
  const plan = plans[planIndex];
  const summary = userText ? `Entendi: ${userText}` : null;
  const steps = plan.steps.map((step, index) => `${index + 1}) ${step}`).join('\n');
  return [summary, plan.intro, steps, plan.reminder, plan.closing].filter(Boolean).join('\n');
};

const estimateDelay = (text) => Math.max(700, Math.min(2200, text.length * 18));

export function ChatBot() {
  const [messages, setMessages] = useState([initialBotMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [pendingFeedbackId, setPendingFeedbackId] = useState(null);
  const [failCount, setFailCount] = useState(0);
  const [escalated, setEscalated] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [lastUserText, setLastUserText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [nextPlanIndex, setNextPlanIndex] = useState(0);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('chat-web-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          setAccepted(parsed.some((msg) => msg.sender === 'user'));
          setNextPlanIndex(0);
        }
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    localStorage.setItem('chat-web-history', JSON.stringify(messages));
  }, [messages]);

  const appendMessages = (...msgs) => setMessages((prev) => [...prev, ...msgs]);

  const handleAccept = () => {
    if (accepted) return;
    setAccepted(true);
    setNextPlanIndex(0);
    appendMessages(
      {
        id: `${Date.now()}-confirm`,
        sender: 'user',
        text: 'Concordo com os termos de tratamento de dados (LGPD) para receber suporte técnico.',
      },
      {
        id: `${Date.now()}-intro`,
        sender: 'bot',
        text: 'Obrigado! Escolha uma categoria abaixo ou descreva o problema com o máximo de detalhes.',
      },
      {
        id: `${Date.now()}-cat-prompt`,
        sender: 'bot',
        kind: 'category-prompt',
        text: 'Escolha uma categoria para agilizar a triagem:',
      },
      {
        id: `${Date.now()}-quick-prompt`,
        sender: 'bot',
        kind: 'quick-prompt',
        text: 'Ou selecione um dos temas rápidos abaixo:',
      },
    );
  };

  const handleCategorySelect = (categoryValue) => {
    if (!accepted || selectedCategory === categoryValue) return;
    setSelectedCategory(categoryValue);
    setFailCount(0);
    setNextPlanIndex(0);
    setPendingFeedbackId(null);
    const steps = categoryGuides[categoryValue] || categoryGuides.Outros;
    const followUp = categoryQuestions[categoryValue] || categoryQuestions.Outros;

    appendMessages(
      {
        id: `${Date.now()}-category-info`,
        sender: 'bot',
        text: `Categoria selecionada: ${categoryValue}.\n${steps.map((step, index) => `${index + 1}) ${step}`).join('\n')}`,
      },
      {
        id: `${Date.now()}-category-question`,
        sender: 'bot',
        text: followUp,
      },
    );
  };

  const handleQuickReply = (text) => {
    setInput(text);
    sendUserMessage(text);
  };

  const sendUserMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading || !accepted || escalated) return;
    setPendingFeedbackId(null);
    const message = { id: `${Date.now()}-user`, sender: 'user', text: trimmed };
    appendMessages(message);
    setInput('');
    await handleProcess(trimmed);
  };

  const historyForLLM = useMemo(
    () =>
      messages.map((message) => ({
        role: message.sender === 'user' ? 'user' : 'assistant',
        content: message.text,
      })),
    [messages],
  );

  const handleProcess = async (userText) => {
    setLoading(true);
    setIsTyping(true);
    const startedAt = Date.now();

    try {
      setLastUserText(userText);
      const guidedText = composeGuidedPlan(selectedCategory, userText, nextPlanIndex);
      if (guidedText) {
        const botMessage = {
          id: `${Date.now()}-bot`,
          sender: 'bot',
          text: guidedText,
        };
        const delay = estimateDelay(guidedText);
        const elapsed = Date.now() - startedAt;
        if (elapsed < delay) {
          await new Promise((resolve) => setTimeout(resolve, delay - elapsed));
        }
        appendMessages(botMessage);
        setPendingFeedbackId(botMessage.id);
        setNextPlanIndex((prev) => prev + 1);
        setLoading(false);
        setTimeout(() => setIsTyping(false), 150);
        return;
      }

      const formattedHistory = [...historyForLLM, { role: 'user', content: userText }];
      const reply = await chatWithAssistant(formattedHistory);
      const botMessage = {
        id: `${Date.now()}-bot`,
        sender: 'bot',
        text:
          reply ||
          'Certo! Descreva o que acontece, quando começou, qual sistema/equipamento está envolvido e se há mensagem de erro.',
      };

      const delay = estimateDelay(botMessage.text);
      const elapsed = Date.now() - startedAt;
      if (elapsed < delay) {
        await new Promise((resolve) => setTimeout(resolve, delay - elapsed));
      }

      let appended = false;
      setMessages((prev) => {
        const lastBot = [...prev].reverse().find((msg) => msg.sender === 'bot');
        if (lastBot && lastBot.text.trim() === botMessage.text.trim()) {
          return prev;
        }
        appended = true;
        return [...prev, botMessage];
      });

      if (appended) setPendingFeedbackId(botMessage.id);
    } catch (error) {
      console.error('Erro ao obter resposta do assistente:', error);
      appendMessages({
        id: `${Date.now()}-err`,
        sender: 'bot',
        text: 'Falha momentânea. Tente novamente em instantes.',
      });
    } finally {
      setLoading(false);
      setTimeout(() => setIsTyping(false), 150);
    }
  };

  const handleFeedback = (resolved) => {
    setPendingFeedbackId(null);
    if (resolved) {
      setFailCount(0);
      setNextPlanIndex(0);
      appendMessages({
        id: `${Date.now()}-ok`,
        sender: 'bot',
        text: 'Perfeito! Se precisar novamente, estou por aqui.',
      });
      return;
    }

    const next = failCount + 1;
    setFailCount(next);
    setNextPlanIndex(0);
    escalate();
  };

  const escalate = async () => {
    if (escalated) return;
    setPendingFeedbackId(null);
    setLoading(true);
    setNextPlanIndex(0);

    try {
      const category = selectedCategory || 'Outros';
      const title = (lastUserText || 'Solicitação de suporte').slice(0, 120);
      const history = messages.map((msg) => `${msg.sender}: ${msg.text}`).join('\n').slice(0, 8000);
      const description = `Resumo da conversa com o bot:\n${history}`;
      const created = await ticketsAPI.create({
        title,
        description,
        category,
        priority: 'high',
      });
      const createdId = created?.id || created?.ticketId || null;
      setTicketId(createdId);
      setEscalated(true);

      try {
        if (createdId) {
          await ticketMessagesAPI.add(createdId, {
            senderType: 'system',
            content: `Histórico do chatbot:\n${history}`,
          });
          if (lastUserText) {
            await ticketMessagesAPI.add(createdId, {
              senderType: 'user',
              content: lastUserText,
            });
          }
        }
      } catch (err) {
        console.warn('Não foi possível anexar histórico ao ticket:', err);
      }

      appendMessages(
        {
          id: `${Date.now()}-sys1`,
          sender: 'system',
          text: `Chamado aberto e encaminhado (${category}). Protocolo: ${createdId || 'em geração'}.`,
        },
        {
          id: `${Date.now()}-sys2`,
          sender: 'bot',
          text: 'Seu chamado foi aberto e um analista continuará a conversa por aqui. Você receberá novidades neste chat.',
        },
      );
    } catch (error) {
      console.error('Erro ao escalar chamado:', error);
      const pseudo = `HL-${Date.now()}`;
      setTicketId(pseudo);
      setEscalated(true);
      appendMessages({
        id: `${Date.now()}-sys-fallback`,
        sender: 'system',
        text: `Chamado aberto com protocolo provisório ${pseudo}. Um analista seguirá do ponto em que paramos.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-slate-100">
      <MobileMenu />
      <UserSidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-3 md:p-10">
          <div className="w-full bg-white border border-slate-200 rounded-none md:rounded-3xl shadow-sm flex flex-col h-full">
            <div className="bg-primary text-primary-foreground px-6 py-5 rounded-t-none md:rounded-t-3xl flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-white/70">Chat</p>
                <h1 className="text-2xl md:text-3xl font-bold text-white">HelpLine</h1>
              </div>
              {ticketId && <span className="text-sm font-medium text-white/80">Protocolo: {ticketId}</span>}
            </div>

            <div className="flex-1 p-4 md:p-8 flex flex-col gap-4">
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 md:pr-3">
                <>
                  {messages.map((message) => {
                    const isCategoryPrompt = message.kind === 'category-prompt';
                    const isQuickPrompt = message.kind === 'quick-prompt';
                    const alignment =
                      message.sender === 'user'
                        ? 'justify-end'
                        : message.sender === 'system'
                        ? 'justify-center'
                        : 'justify-start';
                    const bubbleTone = isQuickPrompt
                      ? 'bg-[#EFF3FF] text-[#16204b] border border-[#dfe7ff]'
                      : isCategoryPrompt
                      ? 'bg-white text-slate-900 border border-slate-200'
                      : bubbleClass(message.sender);
                    return (
                      <div key={message.id} className={`flex w-full ${alignment}`}>
                        <div
                          className={`max-w-full md:max-w-[70%] xl:max-w-[60%] px-6 py-4 rounded-[28px] whitespace-pre-wrap text-[17px] leading-relaxed ${bubbleTone}`}
                        >
                          {renderMessageContent(message.text)}

                          {message.id === 'w1' && !accepted && (
                            <div className="mt-4 w-full">
                              <Button
                                type="button"
                                onClick={handleAccept}
                                className="w-full md:w-auto justify-center text-base font-semibold px-6 py-2.5"
                              >
                                Aceitar e continuar
                              </Button>
                            </div>
                          )}

                          {isCategoryPrompt && accepted && (
                            <div className="space-y-2 mt-3">
                              {categoryOptions.map((option) => (
                                <button
                                  type="button"
                                  key={option.value}
                                  onClick={() => handleCategorySelect(option.value)}
                                  className={`w-full text-left px-4 py-2.5 rounded-2xl text-base font-semibold transition-colors ${
                                    selectedCategory === option.value
                                      ? 'bg-[#4D63F4] text-white shadow-sm'
                                      : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                                  }`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          )}

                          {isQuickPrompt && accepted && (
                            <div className="mt-3 space-y-1">
                              {quickReplies.map((label) => (
                                <button
                                  key={label}
                                  type="button"
                                  onClick={() => handleQuickReply(label)}
                                  className="block w-full text-left text-[16px] font-medium text-[#1a237e] px-0 py-1 rounded-xl hover:bg-white/60 focus:outline-none"
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          )}

                          {pendingFeedbackId === message.id && !escalated && (
                            <div className="flex flex-col sm:flex-row gap-3 mt-4">
                              <Button
                                type="button"
                                className="bg-emerald-600 hover:bg-emerald-700 text-base px-6"
                                onClick={() => handleFeedback(true)}
                              >
                                Resolveu
                              </Button>
                              <Button
                                type="button"
                                className="bg-red-500 hover:bg-red-600 text-base px-6"
                                onClick={() => handleFeedback(false)}
                              >
                                Não resolveu
                              </Button>
                              <Button
                                type="button"
                                className="bg-slate-900 hover:bg-slate-800 text-base px-6"
                                onClick={escalate}
                              >
                                Falar com analista
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {isTyping && !escalated && (
                    <div className="flex justify-start">
                      <div className="inline-flex items-center gap-3 text-sm text-[#4D63F4] bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full shadow-sm">
                        <div className="flex items-center gap-1">
                          {[0, 1, 2].map((dot) => (
                            <span
                              key={dot}
                              className="w-2 h-2 rounded-full bg-[#4D63F4] animate-bounce"
                              style={{ animationDelay: `${dot * 0.15}s` }}
                            />
                          ))}
                        </div>
                        <span className="font-semibold">HelpLine digitando...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  sendUserMessage(input);
                }}
                className="bg-slate-50 border border-slate-200 rounded-[28px] p-4 flex flex-col sm:flex-row gap-3 shadow-sm"
              >
                <Input
                  placeholder={accepted ? 'Descreva seu problema...' : 'Aceite os termos para continuar'}
                  value={input}
                  disabled={!accepted || loading || escalated}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      sendUserMessage(input);
                    }
                  }}
                  className="flex-1 text-lg px-4 py-4 min-h-[56px] bg-white border-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl"
                />
                <Button
                  type="submit"
                  disabled={!accepted || !input.trim() || loading || escalated}
                  className="min-h-[56px] text-base font-semibold px-8 bg-[#4D63F4] hover:bg-[#3d50c0]"
                >
                  {loading ? 'Enviando...' : 'Enviar'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;














