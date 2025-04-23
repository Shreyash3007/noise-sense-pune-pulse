
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

  // Fetch the secret
  const { data, error } = await supabase.rpc('get_secret', { 
    secret_name 
  })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    })
  }

  return new Response(JSON.stringify({ publicData: data }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
