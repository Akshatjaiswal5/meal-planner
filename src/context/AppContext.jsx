import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AppContext = createContext(null);

function toRecipe(row) {
  return {
    id: row.id,
    name: row.name,
    ingredientRefs: row.ingredient_refs || [],
    mealType: row.meal_type || 'any',  // breakfast | lite | dinner | any
  };
}

function toIngredient(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    perishability: row.perishability,
    available: row.available,
    quantity: row.quantity || '',
    unit: row.unit || '',
    stockLevel: row.stock_level || 'full',
    expiryDays: row.expiry_days ?? null,
    restockedAt: row.restocked_at || null,
  };
}

function buildPlanMap(rows) {
  const map = {};
  for (const row of rows) {
    if (!map[row.date]) map[row.date] = {};
    map[row.date][row.slot] = row.recipe_id;
  }
  return map;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Returns days until expiry (negative = already expired). null if no expiry set.
export function daysUntilExpiry(ing) {
  if (!ing.expiryDays || !ing.restockedAt) return null;
  const expiry = new Date(ing.restockedAt + 'T00:00:00');
  expiry.setDate(expiry.getDate() + ing.expiryDays);
  const today = new Date(todayStr() + 'T00:00:00');
  return Math.round((expiry - today) / (1000 * 60 * 60 * 24));
}

export function AppProvider({ children }) {
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [mealPlan, setMealPlan] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Initial load ──────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        { data: recs, error: recErr },
        { data: ings, error: ingErr },
        { data: plan, error: planErr },
      ] = await Promise.all([
        supabase.from('recipes').select('*').order('created_at'),
        supabase.from('ingredients').select('*').order('created_at'),
        supabase.from('meal_plan').select('*'),
      ]);

      if (recErr || ingErr || planErr) throw recErr || ingErr || planErr;

      // Auto-expire: find items where restocked_at + expiry_days <= today
      const today = todayStr();
      const processedIngs = (ings || []).map(toIngredient);
      const toExpire = processedIngs.filter(i => {
        if (i.stockLevel === 'out' || !i.expiryDays || !i.restockedAt) return false;
        const d = daysUntilExpiry(i);
        return d !== null && d <= 0;
      });

      if (toExpire.length > 0) {
        await supabase
          .from('ingredients')
          .update({ stock_level: 'out', available: false })
          .in('id', toExpire.map(i => i.id));
        toExpire.forEach(i => {
          const idx = processedIngs.findIndex(p => p.id === i.id);
          if (idx !== -1) processedIngs[idx] = { ...processedIngs[idx], stockLevel: 'out', available: false };
        });
      }

      setRecipes((recs || []).map(toRecipe));
      setIngredients(processedIngs);
      setMealPlan(buildPlanMap(plan || []));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Recipes ──────────────────────────────────────────────
  async function addRecipe(name, ingredientRefs = [], mealType = 'any') {
    const { data, error } = await supabase
      .from('recipes')
      .insert({ name, ingredient_refs: ingredientRefs, meal_type: mealType })
      .select()
      .single();
    if (error) { console.error(error); return; }
    setRecipes(rs => [...rs, toRecipe(data)]);
    return data.id;
  }

  async function updateRecipe(id, patch) {
    const dbPatch = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.ingredientRefs !== undefined) dbPatch.ingredient_refs = patch.ingredientRefs;
    if (patch.mealType !== undefined) dbPatch.meal_type = patch.mealType;
    const { error } = await supabase.from('recipes').update(dbPatch).eq('id', id);
    if (error) { console.error(error); return; }
    setRecipes(rs => rs.map(r => r.id === id ? { ...r, ...patch } : r));
  }

  async function deleteRecipe(id) {
    const { error } = await supabase.from('recipes').delete().eq('id', id);
    if (error) { console.error(error); return; }
    setRecipes(rs => rs.filter(r => r.id !== id));
    setMealPlan(mp => {
      const next = {};
      for (const [date, slots] of Object.entries(mp)) {
        next[date] = Object.fromEntries(Object.entries(slots).filter(([, rid]) => rid !== id));
      }
      return next;
    });
  }

  // ── Ingredients ───────────────────────────────────────────
  async function addIngredient(data) {
    const { data: row, error } = await supabase
      .from('ingredients')
      .insert({
        name: data.name,
        category: data.category || 'other',
        perishability: data.perishability || 'non_perishable',
        available: data.available ?? true,
        quantity: data.quantity ?? '',
        unit: data.unit || '',
        stock_level: data.stockLevel || 'full',
        expiry_days: data.expiryDays || null,
        restocked_at: data.restockedAt || todayStr(),
      })
      .select()
      .single();
    if (error) { console.error(error); return; }
    setIngredients(is => [...is, toIngredient(row)]);
    return row.id;
  }

  async function updateIngredient(id, patch) {
    // Map camelCase patch to snake_case for DB
    const dbPatch = {};
    const fieldMap = {
      name: 'name', category: 'category', perishability: 'perishability',
      available: 'available', quantity: 'quantity', unit: 'unit',
      stockLevel: 'stock_level', expiryDays: 'expiry_days', restockedAt: 'restocked_at',
    };
    for (const [key, dbKey] of Object.entries(fieldMap)) {
      if (patch[key] !== undefined) dbPatch[dbKey] = patch[key];
    }
    const { error } = await supabase.from('ingredients').update(dbPatch).eq('id', id);
    if (error) { console.error(error); return; }
    setIngredients(is => is.map(i => i.id === id ? { ...i, ...patch } : i));
  }

  async function deleteIngredient(id) {
    const { error } = await supabase.from('ingredients').delete().eq('id', id);
    if (error) { console.error(error); return; }
    setIngredients(is => is.filter(i => i.id !== id));
    const affected = recipes.filter(r => r.ingredientRefs.some(ref => ref.ingredientId === id));
    for (const recipe of affected) {
      const newRefs = recipe.ingredientRefs.filter(ref => ref.ingredientId !== id);
      await updateRecipe(recipe.id, { ingredientRefs: newRefs });
    }
  }

  // Set stock level and sync available flag
  async function setStockLevel(id, level) {
    const available = level !== 'out';
    const patch = { stockLevel: level, available };
    // Reset expiry clock when restocking
    if (available) patch.restockedAt = todayStr();
    await updateIngredient(id, patch);
  }

  // ── Meal Plan ─────────────────────────────────────────────
  async function setMeal(date, slot, recipeId) {
    const { error } = await supabase
      .from('meal_plan')
      .upsert({ date, slot, recipe_id: recipeId }, { onConflict: 'date,slot' });
    if (error) { console.error(error); return; }
    setMealPlan(mp => ({
      ...mp,
      [date]: { ...(mp[date] || {}), [slot]: recipeId },
    }));
  }

  async function clearMeal(date, slot) {
    const { error } = await supabase.from('meal_plan').delete().eq('date', date).eq('slot', slot);
    if (error) { console.error(error); return; }
    setMealPlan(mp => {
      const daySlots = { ...(mp[date] || {}) };
      delete daySlots[slot];
      return { ...mp, [date]: daySlots };
    });
  }

  // ── Derived helpers ───────────────────────────────────────
  function getMissingIngredients(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return [];
    return recipe.ingredientRefs
      .map(ref => ingredients.find(i => i.id === ref.ingredientId))
      .filter(i => i && !i.available);
  }

  function getDayWarnings(dateStr) {
    const slots = mealPlan[dateStr] || {};
    const warnings = [];
    for (const [slot, recipeId] of Object.entries(slots)) {
      const missing = getMissingIngredients(recipeId);
      if (missing.length > 0) {
        const recipe = recipes.find(r => r.id === recipeId);
        warnings.push({ slot, recipeName: recipe?.name, missing });
      }
    }
    return warnings;
  }

  // mode: 'available' (all ingredients in stock) | 'any' (ignore stock)
  // slot: 'breakfast' | 'lunch' | 'dinner' — filters by compatible meal_type
  function suggestRecipe(excludeRecipeIds = [], slot = null, mode = 'available') {
    const today = new Date();
    const recentlyUsed = new Set(excludeRecipeIds);
    for (const [dateStr, slots] of Object.entries(mealPlan)) {
      const d = new Date(dateStr + 'T00:00:00');
      const daysAgo = (today - d) / (1000 * 60 * 60 * 24);
      if (daysAgo >= 0 && daysAgo <= 14) {
        Object.values(slots).forEach(id => recentlyUsed.add(id));
      }
    }

    const slotTypeMap = { breakfast: ['breakfast', 'any'], lunch: ['lite', 'any'], dinner: ['dinner', 'any'] };
    const allowed = slot ? (slotTypeMap[slot] || ['any']) : null;

    let pool = mode === 'available'
      ? recipes.filter(r => getMissingIngredients(r.id).length === 0)
      : [...recipes];

    if (allowed) pool = pool.filter(r => allowed.includes(r.mealType));

    const notRecent = pool.filter(r => !recentlyUsed.has(r.id));
    const finalPool = notRecent.length > 0 ? notRecent : pool;
    if (finalPool.length === 0) return null;
    return finalPool[Math.floor(Math.random() * finalPool.length)];
  }

  return (
    <AppContext.Provider value={{
      recipes, ingredients, mealPlan, loading, error,
      addRecipe, updateRecipe, deleteRecipe,
      addIngredient, updateIngredient, deleteIngredient,
      setStockLevel,
      setMeal, clearMeal,
      getMissingIngredients, getDayWarnings,
      suggestRecipe,
      reload: loadAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
