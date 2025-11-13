import React, { useEffect, useRef, useState } from 'react';
import TopBar from '@/components/TopBar';
import { MobileMenu } from '@/components/MobileMenu';
import UserSidebar from './components/UserSidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Typewriter } from 'react-simple-typewriter';
import { aiAPI } from '@/services/api';

export function ChatBot() {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('chat-web-history');
      return saved
        ? JSON.parse(saved)
        : [
            {
              role: 'assistant',
              content: 'Olá! Sou o assistente HelpLine. Como posso ajudar hoje?'
            }
          ];
    } catch {
      return [
        {
          role: 'assistant',
          content: 'Olá! Sou o assistente HelpLine. Como posso ajudar hoje?'
        }
      ];
    }
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    if (chatEndRef.current)
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    try {
      localStorage.setItem('chat-web-history', JSON.stringify(messages));
    } catch {
      /* empty */
    }
  }, [messages]);

  const parseAssistantReply = (data) => {
    if (!data) return 'Sem resposta.';
    return (
      data.reply ||
      data.message ||
      data.content ||
      (data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content) ||
      (typeof data === 'string' ? data : JSON.stringify(data))
    );
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    setInput('');
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setIsTyping(true);
    try {
      const res = await aiAPI.chat({ messages: next });
      const reply = parseAssistantReply(res);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Erro ao obter resposta: ${e.message}` }
      ]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  const quickPrompts = [
    'Abrir um chamado de suporte',
    'Status do meu ticket',
    'Problemas de rede no escritório',
    'Orientações para instalar software'
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <MobileMenu isManager={false} />
      <UserSidebar />
      <div className="flex-1 flex flex-col bg-gray-50">
        <TopBar />
        <div className="flex-1 p-4 md:p-6">
          <div className="bg-white border border-[#D9D9D9] rounded-lg shadow-sm">
            <div className="bg-primary text-primary-foreground px-4 md:px-6 py-3 rounded-t-lg">
              <h1 className="text-2xl font-bold flex flex-col md:flex-row md:items-center gap-1">
                <span>Assistente</span>
                <span className="text-accent md:ml-2">
                  <Typewriter
                    words={['HelpLine', 'CoreMind']}
                    loop={0}
                    typeSpeed={60}
                    deleteSpeed={40}
                    delaySpeed={1500}
                  />
                </span>
              </h1>
            </div>
            <div className="p-4 md:p-6 flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setInput(q)}
                    className="text-xs md:text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div
                className="flex-1 overflow-y-auto space-y-4"
                style={{ maxHeight: '500px', overflowY: 'auto' }}
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`max-w-xl px-4 py-2 rounded-xl whitespace-pre-wrap ${msg.role === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'mr-auto bg-gray-200 text-black'}`}
                  >
                    {msg.content}
                  </div>
                ))}
                {isTyping && (
                  <div className="mr-auto text-gray-500 text-sm">
                    Digitando…
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="bg-white border border-[#D9D9D9] rounded-lg p-4 flex gap-2"
              >
                <Input
                  placeholder="Digite sua mensagem"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isTyping}>
                  Enviar
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
