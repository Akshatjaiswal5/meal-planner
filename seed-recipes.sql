-- ============================================================
--  RECIPE SEED
--  Run in Supabase SQL Editor.
--  To skip a recipe, delete or comment out its INSERT block.
--  Each block is self-contained — safe to run in any order.
-- ============================================================


-- ── BREAKFAST ───────────────────────────────────────────────

-- Aloo Paratha
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Aloo Paratha', 'breakfast',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Aloo','Flour','Pyaz','Adrak','Mirchi','Dhaniya','Ghee','Salt'))
);

-- Methi Paratha
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Methi Paratha', 'breakfast',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Flour','Methi','Adrak','Mirchi','Haldi','Salt','Ghee'))
);

-- Aloo Sabzi (dry)
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Aloo Sabzi', 'breakfast',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Aloo','Pyaz','Tamatar','Haldi','Lal mirch','Dhaniya powder','Salt','Oil'))
);

-- Paneer Bhurji
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Paneer Bhurji', 'breakfast',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Paneer','Pyaz','Tamatar','Mirchi','Adrak','Haldi','Dhaniya powder','Salt','Oil','Butter'))
);

-- Jeera Aloo
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Jeera Aloo', 'breakfast',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Aloo','Jeera','Mirchi','Haldi','Dhaniya powder','Salt','Oil','Dhaniya'))
);


-- ── LITE (LUNCH) ─────────────────────────────────────────────

-- Dal Tadka
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Dal Tadka', 'lite',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Toor','Pyaz','Tamatar','Adrak Lahsun Paste','Haldi','Jeera','Lal mirch','Dhaniya powder','Salt','Oil','Ghee'))
);

-- Aloo Gobi
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Aloo Gobi', 'lite',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Aloo','Gobi','Pyaz','Tamatar','Adrak Lahsun Paste','Haldi','Dhaniya powder','Lal mirch','Salt','Oil'))
);

-- Jeera Rice
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Jeera Rice', 'lite',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Rice','Jeera','Ghee','Salt'))
);

-- Bhindi Masala
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Bhindi Masala', 'lite',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Bhindi','Pyaz','Tamatar','Haldi','Dhaniya powder','Lal mirch','Salt','Oil'))
);

-- Methi Aloo
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Methi Aloo', 'lite',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Aloo','Methi','Pyaz','Adrak Lahsun Paste','Haldi','Dhaniya powder','Salt','Oil'))
);

-- Rajma
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Rajma', 'lite',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Rajma','Pyaz','Tamatar','Adrak Lahsun Paste','Haldi','Dhaniya powder','Lal mirch','Khada masala','Salt','Oil'))
);

-- Mushroom Masala
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Mushroom Masala', 'lite',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Mushroom','Pyaz','Tamatar','Adrak Lahsun Paste','Haldi','Dhaniya powder','Lal mirch','Salt','Oil'))
);

-- Gajar Matar Sabzi
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Gajar Matar Sabzi', 'lite',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Gajar','Matar','Pyaz','Adrak','Haldi','Dhaniya powder','Salt','Oil','Dhaniya'))
);


-- ── DAILY DINNER ─────────────────────────────────────────────

-- Chana Masala
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Chana Masala', 'dinner',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Kabuli Chana','Pyaz','Tamatar','Adrak Lahsun Paste','Haldi','Dhaniya powder','Lal mirch','Khada masala','Salt','Oil'))
);

-- Dal Makhani
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Dal Makhani', 'dinner',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Udat','Rajma','Pyaz','Tamatar','Adrak Lahsun Paste','Butter','Ghee','Khada masala','Haldi','Lal mirch','Salt'))
);

-- Palak Paneer
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Palak Paneer', 'dinner',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Palak','Paneer','Pyaz','Tamatar','Adrak Lahsun Paste','Haldi','Dhaniya powder','Lal mirch','Salt','Oil','Ghee'))
);

-- Matar Paneer
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Matar Paneer', 'dinner',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Matar','Paneer','Pyaz','Tamatar','Adrak Lahsun Paste','Haldi','Dhaniya powder','Lal mirch','Salt','Oil'))
);

-- Aloo Matar
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Aloo Matar', 'dinner',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Aloo','Matar','Pyaz','Tamatar','Adrak Lahsun Paste','Haldi','Dhaniya powder','Salt','Oil'))
);

-- Baingan Bharta
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Baingan Bharta', 'dinner',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Baingan','Pyaz','Tamatar','Adrak','Mirchi','Haldi','Dhaniya powder','Salt','Oil','Dhaniya'))
);

-- Khichdi
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Khichdi', 'dinner',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Rice','Toor','Adrak','Haldi','Jeera','Ghee','Salt'))
);

-- Green Moong Dal
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Green Moong Dal', 'dinner',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Green Moong','Pyaz','Tamatar','Adrak Lahsun Paste','Haldi','Jeera','Lal mirch','Salt','Oil','Ghee'))
);

-- Arbi Masala
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Arbi Masala', 'dinner',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Arbi','Pyaz','Tamatar','Adrak Lahsun Paste','Haldi','Dhaniya powder','Lal mirch','Salt','Oil'))
);

-- Capsicum Aloo
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Capsicum Aloo', 'dinner',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Capsicum','Aloo','Pyaz','Adrak','Haldi','Dhaniya powder','Lal mirch','Salt','Oil'))
);

-- Tofu Bhurji
INSERT INTO recipes (name, meal_type, ingredient_refs) VALUES (
  'Tofu Bhurji', 'dinner',
  (SELECT jsonb_agg(jsonb_build_object('ingredientId', id))
   FROM ingredients WHERE name IN ('Tofu','Pyaz','Tamatar','Capsicum','Adrak Lahsun Paste','Haldi','Dhaniya powder','Salt','Oil'))
);
