import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface UserProfile {
  id: string;
  full_name: string;
  fide_rating?: number;
  chess_title?: string;
  country?: string;
  date_of_birth?: string;
  chess_club?: string;
  playing_style?: string;
  favorite_opening?: string;
  bio?: string;
  profile_picture_url?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const url = new URL(req.url)
    const userId = url.searchParams.get('user_id') || user.id

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        // Fetch user profile
        const { data: profile, error: fetchError } = await supabaseAdmin
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (fetchError) {
          return new Response(
            JSON.stringify({ error: 'Profile not found' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Include user email from auth.users
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
        
        const profileWithEmail = {
          ...profile,
          email: authUser.user?.email
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: profileWithEmail 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'PUT':
        // Update user profile (only allow users to update their own profile)
        if (userId !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized to update this profile' }),
            { 
              status: 403, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const updateData = await req.json()
        
        const { data: updatedProfile, error: updateError } = await supabaseAdmin
          .from('user_profiles')
          .update({ ...updateData, updated_at: new Date().toISOString() })
          .eq('id', userId)
          .select()
          .single()

        if (updateError) {
          return new Response(
            JSON.stringify({ error: 'Failed to update profile' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: updatedProfile 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            status: 405, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('Error in user-profile function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})