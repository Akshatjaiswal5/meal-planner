import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cbfyrlmaehjdczcdmzfz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZnlybG1hZWhqZGN6Y2RtemZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTAwMjUsImV4cCI6MjA4OTc2NjAyNX0.8T0C_G51Ffmq3hdXYedoxZ6aRbkrzujcOZrTC1vyJfU'
);

const today = new Date().toISOString().slice(0, 10);

const ingredients = [
  // ── Fresh Produce (semi-perishable) ─────────────────────
  { name: 'Aloo',          category: 'produce', perishability: 'semi_perishable' },
  { name: 'Pyaz',          category: 'produce', perishability: 'semi_perishable' },
  { name: 'Gajar',         category: 'produce', perishability: 'semi_perishable' },
  { name: 'Baingan',       category: 'produce', perishability: 'semi_perishable' },
  { name: 'Nimbu',         category: 'produce', perishability: 'semi_perishable' },
  { name: 'Gobi',          category: 'produce', perishability: 'semi_perishable' },
  { name: 'Arbi',          category: 'produce', perishability: 'semi_perishable' },
  { name: 'Adrak',         category: 'produce', perishability: 'semi_perishable' },
  { name: 'Lahsun',        category: 'produce', perishability: 'semi_perishable' },
  { name: 'Capsicum',      category: 'produce', perishability: 'semi_perishable' },
  { name: 'Tamatar',       category: 'produce', perishability: 'semi_perishable' },
  { name: 'Sweet Potato',  category: 'produce', perishability: 'semi_perishable' },
  { name: 'Khira',         category: 'produce', perishability: 'semi_perishable' },
  { name: 'Beetroot',      category: 'produce', perishability: 'semi_perishable' },
  { name: 'Mirchi',        category: 'produce', perishability: 'semi_perishable' },
  { name: 'Matar',         category: 'produce', perishability: 'semi_perishable' },
  { name: 'Haricot beans', category: 'produce', perishability: 'semi_perishable' },
  { name: 'Chaturfalli',   category: 'produce', perishability: 'semi_perishable' },

  // ── Fresh Produce (highly perishable) ───────────────────
  { name: 'Bhindi',        category: 'produce', perishability: 'highly_perishable' },
  { name: 'Fulgobi',       category: 'produce', perishability: 'highly_perishable' },
  { name: 'Pudhina',       category: 'produce', perishability: 'highly_perishable' },
  { name: 'Kadi patta',    category: 'produce', perishability: 'highly_perishable' },
  { name: 'Palak',         category: 'produce', perishability: 'highly_perishable' },
  { name: 'Methi',         category: 'produce', perishability: 'highly_perishable' },
  { name: 'Dhaniya',       category: 'produce', perishability: 'highly_perishable' },
  { name: 'Brocolli',      category: 'produce', perishability: 'highly_perishable' },
  { name: 'Mushroom',      category: 'produce', perishability: 'highly_perishable' },
  { name: 'Tofu',          category: 'produce', perishability: 'highly_perishable' },

  // ── Dairy ────────────────────────────────────────────────
  { name: 'Paneer',        category: 'dairy', perishability: 'highly_perishable' },
  { name: 'Butter',        category: 'dairy', perishability: 'highly_perishable' },
  { name: 'Cheese Slices', category: 'dairy', perishability: 'highly_perishable' },
  { name: 'Ghee',          category: 'dairy', perishability: 'non_perishable' },

  // ── Spices & Condiments ──────────────────────────────────
  { name: 'Salt',               category: 'spices', perishability: 'non_perishable' },
  { name: 'Lal mirch',          category: 'spices', perishability: 'non_perishable' },
  { name: 'Dhaniya powder',     category: 'spices', perishability: 'non_perishable' },
  { name: 'Haldi',              category: 'spices', perishability: 'non_perishable' },
  { name: 'Kali mirch',         category: 'spices', perishability: 'non_perishable' },
  { name: 'Khada masala',       category: 'spices', perishability: 'non_perishable' },
  { name: 'Raii',               category: 'spices', perishability: 'non_perishable' },
  { name: 'Jeera',              category: 'spices', perishability: 'non_perishable' },
  { name: 'Adrak Lahsun Paste', category: 'spices', perishability: 'semi_perishable' },

  // ── Grains & Staples ─────────────────────────────────────
  { name: 'Rice',  category: 'grains', perishability: 'non_perishable' },
  { name: 'Flour', category: 'grains', perishability: 'non_perishable' },
  { name: 'Oil',   category: 'grains', perishability: 'non_perishable' },

  // ── Lentils & Legumes (Canned/Packaged) ──────────────────
  { name: 'Rajma',        category: 'canned', perishability: 'non_perishable' },
  { name: 'Green Moong',  category: 'canned', perishability: 'non_perishable' },
  { name: 'Chana',        category: 'canned', perishability: 'non_perishable' },
  { name: 'Toor',         category: 'canned', perishability: 'non_perishable' },
  { name: 'Kabuli Chana', category: 'canned', perishability: 'non_perishable' },
  { name: 'Udat',         category: 'canned', perishability: 'non_perishable' },
];

const rows = ingredients.map(i => ({
  name: i.name,
  category: i.category,
  perishability: i.perishability,
  available: true,
  quantity: '',
  unit: '',
  stock_level: 'full',
  restocked_at: today,
}));

const { data, error } = await supabase.from('ingredients').insert(rows).select();
if (error) {
  console.error('Error:', error.message);
} else {
  console.log(`✓ Inserted ${data.length} ingredients`);
}
