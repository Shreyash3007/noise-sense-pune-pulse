'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Bot } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OpenRouterChatbox from '@/components/OpenRouterChatbox';
import PageHeader from '@/components/PageHeader';

export default function AIChatPage() {
  // Set up API key directly instead of using environment variables
  const apiKey = "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";

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <PageHeader
        title="AI Assistant"
        description="Ask questions about noise pollution in Pune"
        icon={<Bot className="h-6 w-6" />}
      />
      
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OpenRouterChatbox 
            apiKey={apiKey}
            model="deepseek/deepseek-v3-base:free"
            title="NoiseSense AI Assistant"
            systemPrompt="You are NoiseSense AI, a specialized AI assistant for the Noise Sense Pune Pulse project, focused on noise pollution in Pune, India. You should provide helpful, accurate, and educational responses about noise pollution, its sources, health effects, measurement, regulations, and mitigation strategies. Focus specifically on the context of Pune whenever possible. Be conversational but concise. If you don't know something, admit it rather than making up information."
          />

          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Privacy Notice</AlertTitle>
            <AlertDescription>
              Your conversations with the AI will be processed by OpenRouter. Avoid sharing sensitive personal information.
            </AlertDescription>
          </Alert>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>About NoiseSense AI</CardTitle>
              <CardDescription>How this AI assistant can help you</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="features">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="examples">Examples</TabsTrigger>
                </TabsList>
                <TabsContent value="features" className="space-y-4 mt-4">
                  <p className="text-sm">
                    NoiseSense AI is your specialized assistant for understanding noise pollution in Pune. It can help with:
                  </p>
                  <ul className="list-disc pl-4 text-sm space-y-2">
                    <li>Explaining noise pollution concepts and terminology</li>
                    <li>Suggesting noise mitigation strategies</li>
                    <li>Discussing health impacts of noise exposure</li>
                    <li>Interpreting noise measurement data</li>
                    <li>Providing information about noise regulations in Pune</li>
                    <li>Explaining the Noise Sense Pune Pulse project</li>
                  </ul>
                </TabsContent>
                <TabsContent value="examples" className="space-y-4 mt-4">
                  <p className="text-sm">Try asking questions like:</p>
                  <ul className="list-disc pl-4 text-sm space-y-2">
                    <li>"What are the main sources of noise pollution in Pune?"</li>
                    <li>"How does traffic noise affect health?"</li>
                    <li>"What is the legal noise limit for residential areas?"</li>
                    <li>"How can I reduce noise in my home?"</li>
                    <li>"What time of day is noise pollution worst in Pune?"</li>
                    <li>"What does 70 decibels sound like?"</li>
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 