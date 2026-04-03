'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocaleStore } from '@/lib/store';
import { AnimatePresence, motion } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_ACTIONS = {
  "pt-PT": [
    { label: "📦 Rastrear Encomenda", query: "Como posso rastrear a minha encomenda?" },
    { label: "↩️ Política de Devoluções", query: "Qual é a política de devoluções?" },
    { label: "📞 Contacto", query: "Como posso contactar o apoio ao cliente?" },
  ],
  "fr-FR": [
    { label: "📦 Suivre la commande", query: "Comment suivre ma commande?" },
    { label: "↩️ Politique de retour", query: "Quelle est la politique de retour?" },
    { label: "📞 Contact", query: "Comment contacter le support client?" },
  ],
  "es-ES": [
    { label: "📦 Rastrear Pedido", query: "¿Cómo puedo rastrear mi pedido?" },
    { label: "↩️ Política de Devoluciones", query: "¿Cuál es la política de devoluciones?" },
    { label: "📞 Contacto", query: "¿Cómo puedo contactar al soporte?" },
  ],
  "de-DE": [
    { label: "📦 Bestellung verfolgen", query: "Wie kann ich meine Bestellung verfolgen?" },
    { label: "↩️ Rückgaberichtlinie", query: "Was ist die Rückgaberichtlinie?" },
    { label: "📞 Kontakt", query: "Wie kann ich den Kundenservice kontaktieren?" },
  ],
  "nl-NL": [
    { label: "📦 Bestelling volgen", query: "Hoe kan ik mijn bestelling volgen?" },
    { label: "↩️ Retourbeleid", query: "Wat is het retourbeleid?" },
    { label: "📞 Contact", query: "Hoe kan ik de klantenservice bereiken?" },
  ],
  default: [
    { label: "📦 Track Order", query: "How can I track my order?" },
    { label: "↩️ Return Policy", query: "What is the return policy?" },
    { label: "📞 Contact", query: "How can I contact support?" },
  ],
};

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const locale = useLocaleStore(s => s.country.locale);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), locale, history: messages }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply || data.message || 'Obrigado pelo seu contacto! Um assistente irá ajudá-lo em breve.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        const fallbackMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: getFallbackResponse(locale),
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, fallbackMsg]);
      }
    } catch {
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getFallbackResponse(locale),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
        aria-label={isOpen ? 'Fechar chat' : 'Abrir chat'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-white border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-white p-4 flex items-center gap-3 shrink-0">
              <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Assistente Action</h3>
                <p className="text-xs text-white/80">
                  {locale === 'pt-PT' ? 'Estamos aqui para ajudar' : locale === 'fr-FR' ? 'Nous sommes là pour aider' : locale === 'de-DE' ? 'Wir sind hier um zu helfen' : 'We are here to help'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gray-50">
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <Bot className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    {locale === 'pt-PT' ? 'Olá! Como posso ajudar?' : locale === 'fr-FR' ? 'Bonjour! Comment puis-je aider?' : locale === 'de-DE' ? 'Hallo! Wie kann ich helfen?' : 'Hello! How can I help?'}
                  </p>
                  <div className="space-y-2">
                    {(QUICK_ACTIONS[locale] || QUICK_ACTIONS['default']).map((action, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(action.query)}
                        className="w-full text-left text-xs border rounded-lg px-3 py-2 hover:bg-white hover:border-primary/30 transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-white border rounded-bl-md'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-3 flex items-center gap-2 bg-white shrink-0">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder={
                  locale === 'pt-PT' ? 'Escreva a sua mensagem...' : locale === 'fr-FR' ? 'Écrivez votre message...' : locale === 'de-DE' ? 'Schreiben Sie Ihre Nachricht...' : 'Type your message...'
                }
                className="border-0 bg-gray-50 text-sm h-10 focus-visible:ring-0 focus-visible:border focus-visible:border-primary/30"
                disabled={isTyping}
              />
              <Button
                onClick={() => sendMessage(input)}
                size="icon"
                className="bg-primary hover:bg-primary/90 text-white h-10 w-10 rounded-full shrink-0"
                disabled={isTyping || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function getFallbackResponse(locale: string): string {
  const responses: Record<string, string> = {
    "pt-PT": "Obrigado pelo seu contacto! Neste momento, o nosso assistente está indisponível. Por favor, tente novamente mais tarde ou contacte-nos através do nosso email de apoio ao cliente.",
    "fr-FR": "Merci de nous contacter! Notre assistant est actuellement indisponible. Veuillez réessayer plus tard ou contactez-nous par email.",
    "de-DE": "Vielen Dank für Ihre Kontaktaufnahme! Unser Assistent ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.",
    "nl-NL": "Bedankt voor uw bericht! Onze assistent is momenteel niet beschikbaar. Probeer het later opnieuw.",
    "es-ES": "¡Gracias por contactarnos! Nuestro asistente no está disponible en este momento. Inténtelo de nuevo más tarde.",
    "pt-BR": "Obrigado pelo seu contato! Nosso assistente está indisponível no momento. Tente novamente mais tarde.",
  };
  return responses[locale] || responses["pt-PT"];
}
