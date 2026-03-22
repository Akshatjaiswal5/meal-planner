-- Allow multiple recipes per slot (max 3 enforced in app)
-- Run in Supabase SQL Editor

ALTER TABLE meal_plan DROP CONSTRAINT IF EXISTS meal_plan_date_slot_key;
