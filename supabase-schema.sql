-- Run this once in your Supabase project: SQL Editor → New query

create table if not exists ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'other',
  perishability text not null default 'non_perishable',
  available boolean not null default true,
  quantity text default '',
  unit text default '',
  created_at timestamptz default now()
);

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ingredient_refs jsonb default '[]',
  created_at timestamptz default now()
);

create table if not exists meal_plan (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  slot text not null,       -- breakfast | lunch | dinner
  recipe_id uuid references recipes(id) on delete cascade,
  created_at timestamptz default now(),
  unique(date, slot)
);

-- Enable Row Level Security (allow all for now — single user, no auth)
alter table ingredients enable row level security;
alter table recipes enable row level security;
alter table meal_plan enable row level security;

create policy "public access" on ingredients for all using (true) with check (true);
create policy "public access" on recipes for all using (true) with check (true);
create policy "public access" on meal_plan for all using (true) with check (true);
