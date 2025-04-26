
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reports } = await req.json();

    if (!openAIApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    const systemPrompt = `You are a specialized AI for analyzing noise pollution data. 
    Given a collection of noise reports with details like location, decibel level, and type,
    provide comprehensive insights including patterns, trends, anomalies, and actionable recommendations.
    Format your response as structured JSON with the following sections:
    1. Predictions: Future noise level forecasts
    2. Insights: Key observations about the data
    3. Correlations: Relationships between factors
    4. Anomalies: Unusual patterns detected
    5. recommendedActions: Suggested interventions`;

    const userPrompt = `Analyze the following noise pollution data: ${JSON.stringify(reports)}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const analysisResult = JSON.parse(data.choices[0].message.content);

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-noise-data function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze noise data', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
