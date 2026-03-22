import { useState } from 'react';
import { useApp } from '../context/AppContext';
import './Recipes.css';

export const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', color: '#f59e0b', bg: '#fffbeb', icon: '🌅' },
  { id: 'lite',      label: 'Lite',      color: '#10b981', bg: '#ecfdf5', icon: '🥗' },
  { id: 'dinner',    label: 'Daily Dinner', color: '#6366f1', bg: '#eef2ff', icon: '🍲' },
  { id: 'any',       label: 'Any',       color: '#888',    bg: '#f5f5f5', icon: '🍽️' },
];

export default function Recipes() {
  const { recipes, ingredients, addRecipe, updateRecipe, deleteRecipe } = useApp();
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [showPossible, setShowPossible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm());
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [ingSearch, setIngSearch] = useState('');

  function defaultForm() {
    return { name: '', mealType: 'dinner', ingredientRefs: [] };
  }

  function openNew() {
    setForm(defaultForm());
    setIngSearch('');
    setEditing('new');
  }

  function openEdit(recipe) {
    setForm({ name: recipe.name, mealType: recipe.mealType || 'any', ingredientRefs: recipe.ingredientRefs || [] });
    setIngSearch('');
    setEditing(recipe.id);
  }

  function save() {
    if (!form.name.trim()) return;
    if (editing === 'new') {
      addRecipe(form.name.trim(), form.ingredientRefs, form.mealType);
    } else {
      updateRecipe(editing, { name: form.name.trim(), ingredientRefs: form.ingredientRefs, mealType: form.mealType });
    }
    setEditing(null);
  }

  function toggleIngredient(ingredientId) {
    setForm(f => {
      const exists = f.ingredientRefs.some(r => r.ingredientId === ingredientId);
      return exists
        ? { ...f, ingredientRefs: f.ingredientRefs.filter(r => r.ingredientId !== ingredientId) }
        : { ...f, ingredientRefs: [...f.ingredientRefs, { ingredientId }] };
    });
  }

  function isPossible(recipe) {
    const refs = recipe.ingredientRefs || [];
    if (refs.length === 0) return false;
    return refs.every(ref => {
      const ing = ingredients.find(i => i.id === ref.ingredientId);
      return ing && ing.available;
    });
  }

  const possibleCount = recipes.filter(isPossible).length;

  let filtered = recipes;
  if (search) filtered = filtered.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
  if (activeType !== 'all') filtered = filtered.filter(r => r.mealType === activeType);
  if (showPossible) filtered = filtered.filter(isPossible);

  // Group by meal type
  const grouped = MEAL_TYPES.map(mt => ({
    ...mt,
    items: filtered.filter(r => r.mealType === mt.id),
  })).filter(g => g.items.length > 0);

  const counts = Object.fromEntries(MEAL_TYPES.map(mt => [mt.id, recipes.filter(r => r.mealType === mt.id).length]));

  return (
    <div className="recipes-page">
      <div className="page-header">
        <h1>Recipes</h1>
        <button className="btn-primary" onClick={openNew}>+ New Recipe</button>
      </div>

      {/* Type filter tabs */}
      <div className="meal-type-tabs">
        <button className={`mtype-tab ${activeType === 'all' && !showPossible ? 'active' : ''}`} onClick={() => { setActiveType('all'); setShowPossible(false); }}>
          All <span className="mtype-count">{recipes.length}</span>
        </button>
        <button
          className={`mtype-tab mtype-tab--possible ${showPossible ? 'active' : ''}`}
          onClick={() => setShowPossible(p => !p)}
        >
          ✓ Possible {possibleCount > 0 && <span className="mtype-count">{possibleCount}</span>}
        </button>
        {MEAL_TYPES.map(mt => (
          counts[mt.id] > 0 || activeType === mt.id ? (
            <button
              key={mt.id}
              className={`mtype-tab ${activeType === mt.id && !showPossible ? 'active' : ''}`}
              style={activeType === mt.id && !showPossible ? { background: mt.bg, color: mt.color, borderColor: mt.color } : {}}
              onClick={() => { setActiveType(activeType === mt.id ? 'all' : mt.id); setShowPossible(false); }}
            >
              {mt.icon} {mt.label}
              {counts[mt.id] > 0 && <span className="mtype-count">{counts[mt.id]}</span>}
            </button>
          ) : null
        ))}
      </div>

      <div className="search-bar">
        <input placeholder="Search recipes..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {grouped.length === 0 && (
        <div className="empty-state">
          {search || activeType !== 'all' ? 'No recipes match.' : 'No recipes yet. Add your first one!'}
        </div>
      )}

      {grouped.map(group => (
        <div key={group.id} className="recipe-group">
          <div className="recipe-group-header" style={{ color: group.color }}>
            <span>{group.icon} {group.label}</span>
            <span className="recipe-group-count">{group.items.length}</span>
          </div>
          <ul className="recipe-list">
            {group.items.map(recipe => {
              const linked = (recipe.ingredientRefs || []).map(ref => ingredients.find(i => i.id === ref.ingredientId)).filter(Boolean);
              const unavailable = linked.filter(i => !i.available);
              const mt = MEAL_TYPES.find(m => m.id === recipe.mealType);

              return (
                <li key={recipe.id} className="recipe-item">
                  <div className="recipe-item-main">
                    <div className="recipe-name-row">
                      <span className="recipe-name">{recipe.name}</span>
                      <span className="recipe-type-badge" style={{ color: mt.color, background: mt.bg }}>{mt.icon} {mt.label}</span>
                    </div>
                    <div className="recipe-meta">
                      {linked.length > 0 && <span className="ingredient-count">{linked.length} ingredient{linked.length !== 1 ? 's' : ''}</span>}
                      {unavailable.length > 0 && <span className="unavail-badge">⚠️ {unavailable.length} unavailable</span>}
                    </div>
                  </div>
                  <div className="recipe-actions">
                    <button className="btn-ghost" onClick={() => openEdit(recipe)}>Edit</button>
                    <button className="btn-danger-ghost" onClick={() => setConfirmDelete(recipe.id)}>Delete</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Delete recipe?</h3>
            <p>This will also remove it from your meal plan.</p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => { deleteRecipe(confirmDelete); setConfirmDelete(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
            <h3>{editing === 'new' ? 'New Recipe' : 'Edit Recipe'}</h3>

            <label className="form-label">Name</label>
            <input
              className="form-input"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Recipe name"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && save()}
            />

            <label className="form-label">Type</label>
            <div className="meal-type-selector">
              {MEAL_TYPES.map(mt => (
                <button
                  key={mt.id}
                  className={`mtype-btn ${form.mealType === mt.id ? 'active' : ''}`}
                  style={form.mealType === mt.id ? { background: mt.bg, color: mt.color, borderColor: mt.color } : {}}
                  onClick={() => setForm(f => ({ ...f, mealType: mt.id }))}
                >
                  {mt.icon} {mt.label}
                </button>
              ))}
            </div>

            <label className="form-label" style={{ marginTop: 16 }}>
              Ingredients
              {form.ingredientRefs.length > 0 && <span className="ing-selected-count">{form.ingredientRefs.length} selected</span>}
            </label>
            {ingredients.length === 0 ? (
              <p style={{ fontSize: 14, color: 'var(--label3)', margin: '4px 0 8px' }}>No ingredients in pantry yet.</p>
            ) : (
              <>
                <input
                  className="form-input ing-picker-search"
                  placeholder="Search ingredients..."
                  value={ingSearch}
                  onChange={e => setIngSearch(e.target.value)}
                />
                <ul className="ingredient-picker-list">
                  {ingredients
                    .filter(ing => ing.name.toLowerCase().includes(ingSearch.toLowerCase()))
                    .map(ing => {
                      const checked = form.ingredientRefs.some(r => r.ingredientId === ing.id);
                      return (
                        <li key={ing.id} className="ingredient-picker-item" onClick={() => toggleIngredient(ing.id)}>
                          <span className={`checkbox ${checked ? 'checked' : ''}`}>{checked ? '✓' : ''}</span>
                          <span className="ing-name">{ing.name}</span>
                          {!ing.available && <span className="ing-unavail">out of stock</span>}
                        </li>
                      );
                    })}
                </ul>
              </>
            )}

            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary" onClick={save} disabled={!form.name.trim() || form.ingredientRefs.length === 0}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
