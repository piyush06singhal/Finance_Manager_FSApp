# Fix for Profile Creation Issue

## Problem
Users were getting a foreign key constraint error when trying to create budgets, transactions, or other data because their profile wasn't being created automatically.

Error: `insert or update on table 'budgets' violates foreign key constraint 'budgets_user_id_fkey'`

## Solution
Run the SQL script in your Supabase SQL Editor to fix this issue.

### Steps to Fix:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to "SQL Editor"
4. Click "New Query"
5. Copy and paste the contents of `supabase/fix-profile-insert-policy.sql`
6. Click "Run" or press Ctrl+Enter

### What This Fix Does:

1. **Adds INSERT Policy**: Allows users to create their own profile in the profiles table
2. **Creates Automatic Trigger**: Automatically creates a profile whenever a new user signs up
3. **Prevents Future Issues**: All new users will have profiles created automatically

### Verify the Fix:

After running the SQL:
1. Try signing up with a new account
2. Try creating a budget, transaction, or pot
3. It should work without any foreign key errors

### For Existing Users Without Profiles:

If you have existing users who don't have profiles, they will be created automatically when they:
- Log in (the login page checks and creates profiles)
- Try to access any protected page (budgets, transactions, etc.)

## Files Updated:
- `supabase/schema.sql` - Updated with INSERT policy and trigger
- `supabase/fix-profile-insert-policy.sql` - Standalone fix script
- `src/lib/ensureProfile.ts` - Utility function for manual profile creation
