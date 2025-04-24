
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Create a Supabase client with the Authorization header
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Parse the request body
  const { secret_name } = await req.json()

  // Get the secret value directly from environment variables
  const secretValue = Deno.env.get(secret_name)
  
  if (!secretValue) {
    return new Response(
      JSON.stringify({ error: 'Secret not found' }), 
      { headers: { 'Content-Type': 'application/json' }, status: 404 }
    )
  }

  return new Response(
    JSON.stringify({ data: secretValue }), 
    { headers: { 'Content-Type': 'application/json' } }
  )
})
