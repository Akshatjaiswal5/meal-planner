# Meal Planner

A personal meal planning app built with React and Supabase.

## Features

- **Today** — see what's planned for breakfast, lunch and dinner with ingredient warnings
- **Planner** — weekly and next-day meal planning grid
- **Recipes** — manage recipes with ingredient lists, meal type classification (Breakfast / Lite / Dinner), and a "possible" filter showing only recipes you can make right now
- **Pantry** — track kitchen ingredients with stock levels, auto-expiry, and category grouping

## Stack

- React + Vite
- Supabase (Postgres)
- Deployable to Netlify

## Setup

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in your Supabase URL and anon key
3. Run the SQL in `supabase-schema.sql` and `supabase-migration.sql` in your Supabase project
4. `npm install && npm run dev`
