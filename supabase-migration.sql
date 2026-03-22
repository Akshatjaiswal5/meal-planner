-- Run this in Supabase SQL Editor to add the new columns

alter table ingredients add column if not exists stock_level text default 'full';
alter table ingredients add column if not exists expiry_days integer;
alter table ingredients add column if not exists restocked_at date;

-- Seed restocked_at from created_at for existing rows
update ingredients set restocked_at = created_at::date where restocked_at is null;

-- Add meal_type to recipes
alter table recipes add column if not exists meal_type text default 'any';
