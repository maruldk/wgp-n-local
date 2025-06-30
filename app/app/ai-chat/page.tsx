
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hallo! Ich bin Ihr KI-Assistent für die weGROUP DeepAgent Plattform. Wie kann ich Ihnen heute helfen? Sie können mich zu Kunden, Leads, Geschäftsprozessen oder der Plattform im Allgemeinen fragen.',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          context: {
            page: 'ai-chat',
            platform: 'weGROUP DeepAgent',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const error = await response.json();
        toast({
          title: 'Fehler',
          description: error.error || 'Die KI konnte nicht antworten.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Verbindungsfehler',
        description: 'Fehler beim Kontaktieren des KI-Service.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const suggestionQuestions = [
    'Wie kann ich einen neuen Kunden anlegen?',
    'Zeige mir die Statistiken meiner Leads',
    'Wie funktioniert das Benutzermanagement?',
    'Erkläre mir die Mandantenverwaltung',
    'Welche Funktionen hat die Plattform?',
  ];

  const handleSuggestionClick = (question: string) => {
    setInputMessage(question);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">KI-Assistent</h1>
          <p className="text-gray-600 mt-2">
            Ihr intelligenter Begleiter für alle Fragen zur weGROUP DeepAgent Plattform
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <span>Chat-Verlauf</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === 'ai' && (
                            <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                          )}
                          {message.type === 'user' && (
                            <User className="h-4 w-4 mt-1 flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.type === 'user'
                                  ? 'text-blue-100'
                                  : 'text-gray-500'
                              }`}
                            >
                              {message.timestamp.toLocaleTimeString('de-DE', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-4 w-4" />
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-gray-600">Denkt nach...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Schreiben Sie Ihre Nachricht..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading || !inputMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Suggestions Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Beispielfragen</CardTitle>
                <CardDescription>
                  Klicken Sie auf eine Frage, um sie zu stellen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {suggestionQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left h-auto whitespace-normal justify-start"
                      onClick={() => handleSuggestionClick(question)}
                      disabled={isLoading}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* KI Features Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>KI-Funktionen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium">✨ Beratung</h4>
                    <p className="text-gray-600">Hilfe bei CRM-Aufgaben und Prozessen</p>
                  </div>
                  <div>
                    <h4 className="font-medium">📊 Datenanalyse</h4>
                    <p className="text-gray-600">Insights zu Kunden und Leads</p>
                  </div>
                  <div>
                    <h4 className="font-medium">🔧 Plattform-Support</h4>
                    <p className="text-gray-600">Erklärungen zu Funktionen</p>
                  </div>
                  <div>
                    <h4 className="font-medium">📝 Dokumentation</h4>
                    <p className="text-gray-600">Hilfe bei der Dateneingabe</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
