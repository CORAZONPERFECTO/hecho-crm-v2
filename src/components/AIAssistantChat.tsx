import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, X, Loader2, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantChatProps {
  onClose: () => void;
}

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de IA. Puedo ayudarte a crear tickets, cotizaciones, facturas y más. ¿En qué puedo ayudarte hoy?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://vwyquuwxhwgvzageqkww.supabase.co/functions/v1/ai-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: newMessages.map(m => ({ role: m.role, content: m.content }))
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: 'Límite excedido',
            description: 'Demasiadas solicitudes. Espera un momento.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        if (response.status === 402) {
          toast({
            title: 'Créditos agotados',
            description: 'Agrega créditos a tu workspace de Lovable AI.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        throw new Error('Error en la respuesta');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (reader) {
        setMessages([...newMessages, { role: 'assistant', content: '' }]);
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                
                if (content) {
                  assistantMessage += content;
                  setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
                }
              } catch (e) {
                // Ignorar errores de parsing
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo conectar con el asistente. Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const shareViaWhatsApp = () => {
    const conversationText = messages
      .map((msg) => {
        const prefix = msg.role === 'user' ? '👤 Usuario' : '🤖 Asistente';
        return `${prefix}:\n${msg.content}`;
      })
      .join('\n\n---\n\n');

    const shareText = `*Conversación con Asistente IA*\n\n${conversationText}`;
    const encodedText = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    
    toast({
      title: 'Compartiendo',
      description: 'Abriendo WhatsApp...',
    });
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] flex flex-col shadow-2xl z-50 border-primary/20">
      <div className="flex items-center justify-between p-4 border-b bg-primary/5">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Asistente IA</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={shareViaWhatsApp}
            title="Compartir por WhatsApp"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="rounded-lg px-4 py-2 bg-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
