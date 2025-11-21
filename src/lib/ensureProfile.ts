import { supabase } from './supabase'

export async function ensureUserProfile(userId: string, email: string) {
  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      return { success: true, profile: existingProfile }
    }

    // Profile doesn't exist, create it
    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        name: email.split('@')[0],
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      return { success: false, error: error.message }
    }

    return { success: true, profile: newProfile }
  } catch (error) {
    console.error('Error in ensureUserProfile:', error)
    return { success: false, error: 'Failed to ensure profile exists' }
  }
}
