import { supabase } from './supabase'

/**
 * Ensures a user profile exists in the database
 * Creates one if it doesn't exist
 * Returns the user object or null if not authenticated
 */
export async function ensureUserProfile() {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return null
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    // If profile doesn't exist, create it
    if (!profile || profileError) {
      console.log('Profile not found, creating...')
      
      const { error: insertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          created_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        })

      if (insertError) {
        console.error('Failed to create profile:', insertError)
        throw new Error(`Profile creation failed: ${insertError.message}`)
      }

      console.log('Profile created successfully')
    }

    return user
  } catch (error) {
    console.error('ensureUserProfile error:', error)
    throw error
  }
}

/**
 * Wrapper for database operations that ensures profile exists first
 */
export async function withProfile<T>(
  operation: (userId: string) => Promise<T>
): Promise<T> {
  const user = await ensureUserProfile()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  return operation(user.id)
}
