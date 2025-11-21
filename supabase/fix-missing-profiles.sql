-- Fix Missing Profiles
-- Run this in Supabase SQL Editor if you have users without profiles

-- Create profiles for users that don't have them
INSERT INTO profiles (id, email, name, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  au.created_at
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- Verify all users now have profiles
SELECT 
  COUNT(*) as total_users,
  COUNT(p.id) as users_with_profiles,
  COUNT(*) - COUNT(p.id) as users_without_profiles
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id;
