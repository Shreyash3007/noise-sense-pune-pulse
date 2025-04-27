import { useState } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const OpenRouterTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const testAPI = async () => {
    setIsLoading(true);
    setResult(null);
    const apiKey = "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";

    try {
      console.log("Testing with API key starting with:", apiKey ? apiKey.substring(0, 5) + "..." : "missing");
      
      if (!apiKey) {
        throw new Error("API key is missing");
      }

      // First test the key endpoint
      const keyResponse = await fetch('https://openrouter.ai/api/v1/auth/key', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Key validation response:", keyResponse.status);
      
      if (!keyResponse.ok) {
        const errorText = await keyResponse.text();
        throw new Error(`API key validation failed: ${errorText}`);
      }

      // Now test a simple chat completion
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'NoiseSense API Test'
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-v3-base:free",
          messages: [{ role: "user", content: "Say hello" }],
          max_tokens: 10
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Chat completion failed: ${errorText}`);
      }

      const data = await response.json();
      
      setResult({
        success: true,
        message: "API connection successful!",
        details: `Response: ${data.choices[0].message.content}`
      });
    } catch (error) {
      console.error("API test error:", error);
      setResult({
        success: false,
        message: "API connection failed",
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold">OpenRouter API Test</h2>
      
      <Button 
        onClick={testAPI} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Testing API Connection...
          </>
        ) : (
          "Test OpenRouter API Connection"
        )}
      </Button>

      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertTitle>{result.message}</AlertTitle>
          {result.details && (
            <AlertDescription>
              {result.details}
            </AlertDescription>
          )}
        </Alert>
      )}
      
      <div className="text-sm text-gray-500 border-t pt-4 mt-4">
        <p>This component tests if your OpenRouter API key is working correctly.</p>
        <p className="mt-2">If the test fails, please:</p>
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>Check if your API key is valid and not expired</li>
          <li>Verify there are no extra spaces in the API key</li>
          <li>Make sure the key is prefixed with "sk-or-"</li>
          <li>Verify you have sufficient credits in your OpenRouter account</li>
        </ol>
      </div>
    </div>
  );
};

export default OpenRouterTest; 