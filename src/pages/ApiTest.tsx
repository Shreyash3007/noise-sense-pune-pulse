import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import OpenRouterTest from "@/components/OpenRouterTest";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";

const ApiTest = () => {
  return (
    <motion.div
      className="container py-8 px-4 mx-auto max-w-5xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Helmet>
        <title>API Tests | NoiseSense</title>
      </Helmet>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Connection Tests</h1>
        <p className="text-muted-foreground">
          Test the connections to various APIs used by the application.
        </p>
      </div>

      <Tabs defaultValue="openrouter" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="openrouter">OpenRouter API</TabsTrigger>
          <TabsTrigger value="supabase">Supabase</TabsTrigger>
          <TabsTrigger value="mapbox">Mapbox</TabsTrigger>
        </TabsList>

        <TabsContent value="openrouter">
          <Card>
            <CardHeader>
              <CardTitle>OpenRouter API Test</CardTitle>
              <CardDescription>
                Test the connection to OpenRouter AI API that powers the chatbot.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OpenRouterTest />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supabase">
          <Card>
            <CardHeader>
              <CardTitle>Supabase Connection Test</CardTitle>
              <CardDescription>
                Test the connection to Supabase database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 text-center text-muted-foreground">
                Supabase test component will be implemented soon.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapbox">
          <Card>
            <CardHeader>
              <CardTitle>Mapbox API Test</CardTitle>
              <CardDescription>
                Test the connection to Mapbox API used for maps.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 text-center text-muted-foreground">
                Mapbox test component will be implemented soon.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default ApiTest; 