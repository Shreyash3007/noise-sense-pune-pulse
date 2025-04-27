'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Avatar } from './ui/avatar';
import { Input } from './ui/input';
import { SendIcon, Bot, User, Loader2 } from 'lucide-react';

// Message type definition
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// Props interface
interface OpenRouterChatboxProps {
  apiKey?: string;
  model?: string;
  systemPrompt?: string;
  title?: string;
}

export default function OpenRouterChatbox({
  apiKey = "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",
  model = "deepseek/deepseek-v3-base:free",
  systemPrompt = "You are NoiseSense AI, a specialized assistant for noise pollution monitoring and analysis. Provide concise, helpful responses about noise pollution, its effects on health, mitigation strategies, and interpretation of noise data. Focus on being accurate, educational, and solution-oriented.",
  title = "NoiseSense AI Assistant"
}: OpenRouterChatboxProps) {
  // Debug the API key on component load
  useEffect(() => {
    console.log("Using hardcoded API key:", apiKey ? "Present (masked)" : "Missing");
    console.log("API key passed to component:", apiKey ? `Present (${apiKey.substring(0, 5)}...)` : "Missing");
  }, [apiKey]);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Hello! I'm your NoiseSense AI assistant. I can help you understand noise pollution data, provide recommendations for noise reduction, or answer questions about how noise affects health and well-being. How can I assist you today?", 
      timestamp: new Date().toISOString() 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = { 
      role: 'user', 
      content: input, 
      timestamp: new Date().toISOString() 
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Debug the API key
      console.log("Using API key length:", apiKey ? apiKey.length : 0);
      console.log("First 10 chars of API key:", apiKey ? apiKey.substring(0, 10) : "missing");

      // Check if API key is available
      if (!apiKey || apiKey.trim() === "") {
        throw new Error('API key not configured. Please contact the administrator.');
      }

      // Prepare messages for API including system prompt
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.filter(m => m.role !== 'system'),
        userMessage
      ];
      
      // Ensure API key is properly formatted - should start with "sk-or-"
      const formattedApiKey = apiKey.trim();
      if (!formattedApiKey.startsWith('sk-or-')) {
        console.warn("API key format may be incorrect. Should start with 'sk-or-'");
      }
      
      // Log request details for debugging
      console.log("Making API request to:", 'https://openrouter.ai/api/v1/chat/completions');
      console.log("Using model:", model);
      
      // Call OpenRouter API with properly formatted authorization header
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${formattedApiKey}`,
          'HTTP-Referer': window.location.origin, // Required for OpenRouter
          'X-Title': 'NoiseSense Pune Pulse' // Optional, helps OpenRouter with analytics
        },
        body: JSON.stringify({
          model: model,
          messages: apiMessages.map(({ role, content }) => ({ role, content })),
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      console.log("API response status:", response.status);
      
      if (!response.ok) {
        let errorMessage = "API Error";
        try {
          const errorData = await response.json();
          console.error("API Error details:", errorData);
          errorMessage = errorData.error?.message || errorData.message || `Error ${response.status}: ${response.statusText}`;
        } catch (parseError) {
          const errorText = await response.text();
          console.error(`API Error (${response.status}):`, errorText);
          errorMessage = errorText || `Error ${response.status}: ${response.statusText}`;
        }
        
        // More specific error message based on status code
        if (response.status === 401) {
          throw new Error('Authentication failed: Invalid API key or expired token. Please check your OpenRouter API key.');
        } else if (response.status === 403) {
          throw new Error('Access denied: You do not have permission to use this model or your credits may have expired.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded: Too many requests. Please try again later.');
        } else if (response.status >= 500) {
          throw new Error('Server error: The AI service is currently experiencing issues. Please try again later.');
        } else {
          throw new Error(`API error: ${errorMessage}`);
        }
      }
      
      const data = await response.json();
      console.log("API response data received successfully");
      
      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error("API returned an invalid response format");
      }
      
      const aiResponse = data.choices[0].message.content;
      
      // Add AI response to chat
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: aiResponse, 
          timestamp: new Date().toISOString() 
        }
      ]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // User-friendly error message
      let errorMessage = error instanceof Error 
        ? error.message 
        : 'Sorry, I encountered an error. Please try again later.';
      
      // Add AI error response to chat
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `Error: ${errorMessage}`, 
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
          >
            {message.role === 'assistant' && (
              <Avatar className="h-8 w-8 bg-primary/20">
                <Bot className="h-4 w-4 text-primary" />
              </Avatar>
            )}
            
            <div 
              className={`rounded-lg p-3 max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
            
            {message.role === 'user' && (
              <Avatar className="h-8 w-8 bg-primary">
                <User className="h-4 w-4 text-primary-foreground" />
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>
      
      <CardFooter className="border-t p-3">
        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about noise pollution..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
} 