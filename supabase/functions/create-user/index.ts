
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')

    // Verify the user making the request is authenticated
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'No autorizado. Debes estar autenticado para crear usuarios.' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if the authenticated user has admin or manager role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'manager'].includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: 'Permisos insuficientes. Solo administradores y gerentes pueden crear usuarios.' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the user data from the request body
    const { email, password, name, phone, role } = await req.json()

    console.log('Creating user with admin privileges:', { email, name, role })

    // Create the user using admin client
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        phone,
        role
      }
    })

    if (createError) {
      console.error('Error creating auth user:', createError)
      
      // Handle specific error cases with user-friendly messages
      let errorMessage = 'Error al crear el usuario.'
      
      if (createError.message.includes('email_exists') || createError.message.includes('already been registered')) {
        errorMessage = `Ya existe un usuario registrado con el email: ${email}. Por favor, usa un email diferente.`
      } else if (createError.message.includes('invalid_email')) {
        errorMessage = 'El formato del email no es válido.'
      } else if (createError.message.includes('password')) {
        errorMessage = 'La contraseña no cumple con los requisitos mínimos.'
      } else {
        errorMessage = createError.message
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'No se pudo crear el usuario. Inténtalo de nuevo.' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // First create entry in users table so the trigger can find it
    const { error: usersError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: authData.user.id,
        name,
        email,
        phone,
        role,
        status: 'active'
      }])

    if (usersError) {
      console.error('Error creating user entry:', usersError)
      // If users creation fails, delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return new Response(
        JSON.stringify({ error: 'Error al crear los datos del usuario.' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verify the profile was created
    const { data: newUserProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.error('Error verifying profile creation:', profileError)
      // Clean up both users and auth
      await supabaseAdmin.from('users').delete().eq('id', authData.user.id)
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return new Response(
        JSON.stringify({ error: 'Error al verificar la creación del perfil.' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User created successfully:', authData.user.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: newUserProfile.name,
          phone: newUserProfile.phone,
          role: newUserProfile.role,
          status: newUserProfile.status
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in create-user function:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor. Inténtalo de nuevo.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
