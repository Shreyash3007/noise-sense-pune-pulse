import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Mic, Download } from "lucide-react";
import { NoiseAIResponse, NoiseAIMessage } from "@/types";
import { chatWithAI, getAIWelcomeMessage } from "@/integrations/openai/client";
import { useToast } from "@/components/ui/use-toast";
import { Avatar } from "@/components/ui/avatar";
import NoiseSenseLogo from './NoiseSenseLogo';
import ReactMarkdown from 'react-markdown';

interface ChatBoxProps {
  className?: string;
  isAdmin?: boolean;
  initialMessage?: string;
  compact?: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({ 
  className = "", 
  isAdmin = false,
  initialMessage,
  compact = false
}) => {
  const [messages, setMessages] = useState<NoiseAIResponse[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      { 
        text: initialMessage || getAIWelcomeMessage(), 
        timestamp: new Date().toISOString(),
        source: 'ai' 
      }
    ]);
  }, [initialMessage]);

  // Auto scroll to bottom when new messages come in
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Debounced chat function to prevent spamming
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: NoiseAIResponse = {
      text: input.trim(),
      timestamp: new Date().toISOString(),
      source: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Format messages for AI with the correct format
      const aiMessages: NoiseAIMessage[] = [
        { 
          role: 'system', 
          content: isAdmin 
            ? 'You are NoiseSense AI, a specialized assistant for noise pollution management with access to detailed analytics. Help government officials and administrators understand noise data, identify problematic areas, and suggest policy interventions.' 
            : 'You are NoiseSense AI, a helpful assistant that provides information about noise pollution, its effects, and mitigation strategies to the general public in a clear and accessible way.'
        },
        ...messages.map(msg => ({
          role: msg.source === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.text
        })),
        { role: 'user', content: userMessage.text }
      ];

      // Get AI response
      const response = await chatWithAI(aiMessages);

      const aiResponse: NoiseAIResponse = {
        text: response,
        timestamp: new Date().toISOString(),
        source: 'ai'
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add a fallback message on error
      const fallbackResponse: NoiseAIResponse = {
        text: "I'm having trouble processing your request right now. Please try again later.",
        timestamp: new Date().toISOString(),
        source: 'ai'
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
      
      toast({
        title: "Error",
        description: "Failed to get a response. Using local fallback.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const downloadChatHistory = () => {
    const chatText = messages.map(msg => 
      `${msg.source === 'ai' ? 'NoiseSense AI' : 'You'} (${new Date(msg.timestamp).toLocaleString()}):\n${msg.text}\n\n`
    ).join('');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noisesense-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Chat history downloaded",
      description: "Your conversation has been saved as a text file.",
    });
  };

  return (
    <Card className={`flex flex-col ${compact ? 'h-[400px]' : 'h-[600px]'} ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 bg-purple-100 dark:bg-purple-900/30 border-b">
        <div className="flex items-center">
          <NoiseSenseLogo size="sm" className="mr-2" />
          <h3 className="font-medium">{isAdmin ? "NoiseSense AI Admin Assistant" : "NoiseSense AI Assistant"}</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={downloadChatHistory} title="Download chat history">
          <Download className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.source === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`flex max-w-[80%] ${message.source === 'user' 
                  ? 'flex-row-reverse items-end' 
                  : 'items-start'}`}
              >
                {message.source === 'ai' && (
                  <Avatar className="h-8 w-8 mr-2 bg-purple-100 dark:bg-purple-900/50">
                    <NoiseSenseLogo size="sm" />
                  </Avatar>
                )}
                
                <div 
                  className={`rounded-lg px-4 py-2 ${message.source === 'user' 
                    ? 'bg-primary text-primary-foreground ml-2' 
                    : 'bg-muted'}`}
                >
                  <div className="prose dark:prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        // Define any custom components you need
                        p: ({ children }) => <p className="my-1">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 my-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 my-2">{children}</ol>,
                        li: ({ children }) => <li className="my-1">{children}</li>,
                        h1: ({ children }) => <h1 className="text-lg font-bold my-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-md font-bold my-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold my-2">{children}</h3>,
                        a: ({ href, children }) => <a href={href} className="text-primary underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                        code: ({ children }) => <code className="bg-muted-foreground/20 rounded px-1">{children}</code>,
                        pre: ({ children }) => <pre className="bg-muted-foreground/20 p-2 rounded my-2 overflow-x-auto">{children}</pre>
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                  <div className={`text-xs mt-1 ${message.source === 'user' 
                    ? 'text-primary-foreground/70' 
                    : 'text-muted-foreground'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                
                {message.source === 'user' && (
                  <Avatar className="h-8 w-8 ml-2 bg-primary/25">
                    <div className="text-xs font-semibold">YOU</div>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            ref={inputRef}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatBox;
