-- Migration: Move all tables from public schema to meal_planner schema
-- Run this in Supabase SQL Editor

-- Step 1: Create the new schema
CREATE SCHEMA IF NOT EXISTS meal_planner;

-- Step 2: Move tables (RLS policies and indexes move with the table)
ALTER TABLE public.meal_plan SET SCHEMA meal_planner;   -- move this first (has FK to recipes)
ALTER TABLE public.recipes SET SCHEMA meal_planner;
ALTER TABLE public.ingredients SET SCHEMA meal_planner;

-- Step 3: Grant permissions so PostgREST (anon/authenticated) can access the schema
GRANT USAGE ON SCHEMA meal_planner TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA meal_planner TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA meal_planner TO anon, authenticated, service_role;

-- Step 4: Make future tables in this schema auto-grant permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA meal_planner
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA meal_planner
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- ──────────────────────────────────────────────────────────────────────────────
-- IMPORTANT: After running this SQL, go to:
--   Supabase Dashboard → Settings → API → "Extra schemas to expose via API"
-- Add "meal_planner" there so PostgREST exposes the schema via the REST API.
-- ──────────────────────────────────────────────────────────────────────────────
