-- Script to Clear All Data from BEEW Database
-- Run this in your Supabase SQL Editor to reset the database

-- WARNING: This will delete ALL data from your tables!
-- Make sure you want to do this before running.

-- 1. Delete all watchlists
DELETE FROM public.watchlists;

-- 2. Delete all market reports
DELETE FROM public.market_reports;

-- 3. Delete all strategies
DELETE FROM public.strategies;

-- 4. Delete all profiles
DELETE FROM public.profiles;

-- 5. Delete all auth users (OPTIONAL - Use Supabase Dashboard for this)
-- Note: Deleting from auth.users requires special permissions
-- It's recommended to delete users via the Supabase Dashboard > Authentication > Users
-- Or use the Supabase Admin API

-- Uncomment the line below ONLY if you have the necessary permissions:
-- DELETE FROM auth.users;

-- Verification: Check that tables are empty
SELECT 'watchlists' as table_name, COUNT(*) as row_count FROM public.watchlists
UNION ALL
SELECT 'market_reports', COUNT(*) FROM public.market_reports
UNION ALL
SELECT 'strategies', COUNT(*) FROM public.strategies
UNION ALL
SELECT 'profiles', COUNT(*) FROM public.profiles;
