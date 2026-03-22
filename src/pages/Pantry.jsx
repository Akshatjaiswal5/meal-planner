import { useState } from 'react';
import { useApp, daysUntilExpiry } from '../context/AppContext';
import './Pantry.css';

const CATEGORIES = [
  { id: 'produce', label: 'Fresh Produce', perishability: 'semi_perishable', color: '#5cb85c' },
  { id: 'dairy', label: 'Dairy & Eggs', perishability: 'highly_perishable', color: '#5bc0de' },
  { id: 'meat', label: 'Meat & Seafood', perishability: 'highly_perishable', color: '#e05c5c' },
  { id: 'grains', label: 'Grains & Bread', perishability: 'semi_perishable', color: '#e2a96f' },
  { id: 'frozen', label: 'Frozen', perishability: 'non_perishable', color: '#a0c4e2' },
  { id: 'canned', label: 'Canned & Packaged', perishability: 'non_perishable', color: '#9e9e9e' },
  { id: 'spices', label: 'Spices & Condiments', perishability: 'non_perishable', color: '#ce93d8' },
  { id: 'other', label: 'Other', perishability: 'non_perishable', color: '#bdbdbd' },
];

const PERISHABILITY_LABELS = {
  highly_perishable: { label: 'Highly Perishable', color: '#e05c5c', bg: '#ffe0e0' },
  semi_perishable: { label: 'Semi-Perishable', color: '#b8860b', bg: '#fff8e1' },
  non_perishable: { label: 'Non-Perishable', color: '#5cb85c', bg: '#e8f5e9' },
};

const STOCK_LEVELS = [
  { id: 'full', label: 'Full', color: '#2e7d32', bg: '#e8f5e9' },
  { id: 'half', label: 'Half', color: '#7b6000', bg: '#fff8e1' },
  { id: 'low', label: 'Low', color: '#e65100', bg: '#fff3e0' },
  { id: 'out', label: 'Out', color: '#c62828', bg: '#ffebee' },
];

const UNITS = ['', 'g', 'kg', 'ml', 'L', 'pcs', 'cups', 'tbsp', 'tsp', 'bunch', 'pack', 'can'];

function defaultForm() {
  return {
    name: '', category: 'produce', perishability: 'semi_perishable',
    available: true, quantity: '', unit: '',
    stockLevel: 'full', expiryDays: '', restockedAt: new Date().toISOString().slice(0, 10),
  };
}

export default function Pantry() {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient, setStockLevel } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editMode, setEditMode] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm());
  const [confirmDelete, setConfirmDelete] = useState(null);

  function openNew() {
    setForm(defaultForm());
    setEditing('new');
  }

  function openEdit(ing) {
    setForm({
      name: ing.name,
      category: ing.category,
      perishability: ing.perishability,
      available: ing.available,
      quantity: ing.quantity || '',
      unit: ing.unit || '',
      stockLevel: ing.stockLevel || 'full',
      expiryDays: ing.expiryDays ?? '',
      restockedAt: ing.restockedAt || new Date().toISOString().slice(0, 10),
    });
    setEditing(ing.id);
  }

  function handleCategoryChange(cat) {
    const catDef = CATEGORIES.find(c => c.id === cat);
    setForm(f => ({ ...f, category: cat, perishability: catDef?.perishability || f.perishability }));
  }

  function handleStockLevelChange(level) {
    setForm(f => ({ ...f, stockLevel: level, available: level !== 'out' }));
  }

  function save() {
    if (!form.name.trim()) return;
    const data = {
      ...form,
      name: form.name.trim(),
      expiryDays: form.expiryDays !== '' ? parseInt(form.expiryDays, 10) : null,
      available: form.stockLevel !== 'out',
    };
    if (editing === 'new') {
      addIngredient(data);
    } else {
      updateIngredient(editing, data);
    }
    setEditing(null);
  }

  // Compute expiry status for each ingredient
  const withExpiry = ingredients.map(ing => {
    const days = daysUntilExpiry(ing);
    return { ...ing, daysLeft: days };
  });

  // Filter counts
  const availableCount = ingredients.filter(i => i.stockLevel !== 'out').length;
  const outCount = ingredients.filter(i => i.stockLevel === 'out').length;
  const lowCount = ingredients.filter(i => i.stockLevel === 'low').length;
  const expiringCount = withExpiry.filter(i => i.daysLeft !== null && i.daysLeft >= 0 && i.daysLeft <= 3).length;

  let filtered = withExpiry;
  if (activeCategory !== 'all') filtered = filtered.filter(i => i.category === activeCategory);
  if (search) filtered = filtered.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  if (filter === 'available') filtered = filtered.filter(i => i.stockLevel !== 'out');
  if (filter === 'out') filtered = filtered.filter(i => i.stockLevel === 'out');
  if (filter === 'low') filtered = filtered.filter(i => i.stockLevel === 'low' || i.stockLevel === 'out');
  if (filter === 'expiring') filtered = filtered.filter(i => i.daysLeft !== null && i.daysLeft <= 3);

  const grouped = activeCategory === 'all'
    ? CATEGORIES.map(cat => ({
        ...cat,
        items: filtered.filter(i => i.category === cat.id),
      })).filter(g => g.items.length > 0)
    : [{ ...CATEGORIES.find(c => c.id === activeCategory), items: filtered }];

  return (
    <div className="pantry-page">
      <div className="page-header">
        <h1>Pantry</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={editMode ? 'btn-edit-mode-active' : 'btn-edit-mode'}
            onClick={() => setEditMode(e => !e)}
          >
            {editMode ? 'Done' : 'Edit'}
          </button>
          {!editMode && <button className="btn-primary" onClick={openNew}>+ Add</button>}
        </div>
      </div>

      {/* Status bar */}
      <div className="status-bar">
        <button className={`status-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All <span>{ingredients.length}</span>
        </button>
        <button className={`status-chip status-chip--available ${filter === 'available' ? 'active' : ''}`} onClick={() => setFilter(f => f === 'available' ? 'all' : 'available')}>
          ✓ Available <span>{availableCount}</span>
        </button>
        {outCount > 0 && (
          <button className={`status-chip status-chip--out ${filter === 'out' ? 'active' : ''}`} onClick={() => setFilter(f => f === 'out' ? 'all' : 'out')}>
            🛒 Out of stock <span>{outCount}</span>
          </button>
        )}
        {lowCount > 0 && (
          <button className={`status-chip status-chip--low ${filter === 'low' ? 'active' : ''}`} onClick={() => setFilter(f => f === 'low' ? 'all' : 'low')}>
            ⚠ Running low <span>{lowCount}</span>
          </button>
        )}
        {expiringCount > 0 && (
          <button className={`status-chip status-chip--expiring ${filter === 'expiring' ? 'active' : ''}`} onClick={() => setFilter(f => f === 'expiring' ? 'all' : 'expiring')}>
            ⏱ Expiring soon <span>{expiringCount}</span>
          </button>
        )}
      </div>

      <div className="pantry-controls">
        <input
          className="pantry-search"
          placeholder="Search ingredients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="category-tabs">
        <button className={`cat-tab ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>All</button>
        {CATEGORIES.map(cat => {
          const count = ingredients.filter(i => i.category === cat.id).length;
          if (count === 0 && activeCategory !== cat.id) return null;
          return (
            <button
              key={cat.id}
              className={`cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
              style={activeCategory === cat.id ? { '--cat-color': cat.color } : {}}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
              {count > 0 && <span className="cat-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {grouped.length === 0 && (
        <div className="empty-state">
          {search || filter !== 'all'
            ? 'No ingredients match your filters.'
            : 'No ingredients yet. Add some to start tracking your pantry!'}
        </div>
      )}

      {grouped.map(group => (
        <div key={group.id} className="ingredient-group">
          <div className="group-header">
            <span className="group-dot" style={{ background: group.color }} />
            <span className="group-label">{group.label}</span>
            <span className="group-perish" style={{
              color: PERISHABILITY_LABELS[group.perishability]?.color,
              background: PERISHABILITY_LABELS[group.perishability]?.bg,
            }}>
              {PERISHABILITY_LABELS[group.perishability]?.label}
            </span>
            <span className="group-count">{group.items.length}</span>
          </div>
          <div className="ingredient-cards">
            {group.items.map(ing => (
              <IngredientCard
                key={ing.id}
                ingredient={ing}
                editMode={editMode}
                onSetStock={level => setStockLevel(ing.id, level)}
                onEdit={() => openEdit(ing)}
                onDelete={() => setConfirmDelete(ing.id)}
              />
            ))}
          </div>
        </div>
      ))}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Remove ingredient?</h3>
            <p>It will also be removed from any recipes that use it.</p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => { deleteIngredient(confirmDelete); setConfirmDelete(null); }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
            <h3>{editing === 'new' ? 'Add Ingredient' : 'Edit Ingredient'}</h3>

            <label className="form-label">Name</label>
            <input
              className="form-input"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Tomatoes"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && save()}
            />

            <label className="form-label">Category</label>
            <select className="form-input" value={form.category} onChange={e => handleCategoryChange(e.target.value)}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>

            <label className="form-label">Perishability</label>
            <div className="radio-group">
              {Object.entries(PERISHABILITY_LABELS).map(([val, meta]) => (
                <label key={val} className={`radio-item ${form.perishability === val ? 'selected' : ''}`}
                  style={form.perishability === val ? { borderColor: meta.color, background: meta.bg } : {}}>
                  <input type="radio" value={val} checked={form.perishability === val}
                    onChange={() => setForm(f => ({ ...f, perishability: val }))} />
                  <span style={{ color: form.perishability === val ? meta.color : undefined }}>{meta.label}</span>
                </label>
              ))}
            </div>

            <div className="form-row">
              <div style={{ flex: 1 }}>
                <label className="form-label">Quantity</label>
                <input className="form-input" type="text" value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="e.g. 3" />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label">Unit</label>
                <select className="form-input" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                  {UNITS.map(u => <option key={u} value={u}>{u || '—'}</option>)}
                </select>
              </div>
            </div>

            <label className="form-label">Stock Level</label>
            <div className="stock-level-selector">
              {STOCK_LEVELS.map(s => (
                <button
                  key={s.id}
                  className={`stock-btn ${form.stockLevel === s.id ? 'active' : ''}`}
                  style={form.stockLevel === s.id ? { background: s.bg, color: s.color, borderColor: s.color } : {}}
                  onClick={() => handleStockLevelChange(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="form-row" style={{ marginTop: 14 }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">Auto-expire after (days)</label>
                <input className="form-input" type="number" min="1" value={form.expiryDays}
                  onChange={e => setForm(f => ({ ...f, expiryDays: e.target.value }))}
                  placeholder="e.g. 7 for milk" />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label">Restocked on</label>
                <input className="form-input" type="date" value={form.restockedAt}
                  onChange={e => setForm(f => ({ ...f, restockedAt: e.target.value }))} />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary" onClick={save} disabled={!form.name.trim()}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IngredientCard({ ingredient, editMode, onSetStock, onEdit, onDelete }) {
  const perish = PERISHABILITY_LABELS[ingredient.perishability];
  const days = ingredient.daysLeft;

  let expiryBadge = null;
  if (days !== null) {
    if (days < 0) {
      expiryBadge = { text: `Expired ${Math.abs(days)}d ago`, color: '#c62828', bg: '#ffebee' };
    } else if (days === 0) {
      expiryBadge = { text: 'Expires today', color: '#c62828', bg: '#ffebee' };
    } else if (days <= 3) {
      expiryBadge = { text: `Expires in ${days}d`, color: '#e65100', bg: '#fff3e0' };
    } else {
      expiryBadge = { text: `${days}d left`, color: '#777', bg: '#f5f5f5' };
    }
  }

  return (
    <div
      className={`ingredient-card ${ingredient.stockLevel === 'out' ? 'ingredient-card--out' : ''} ${ingredient.stockLevel === 'low' ? 'ingredient-card--low' : ''} ${editMode ? 'ingredient-card--editing' : ''}`}
      onClick={editMode ? onEdit : undefined}
    >
      <div className="ing-card-top">
        {editMode && (
          <button
            className="ing-delete-circle"
            onClick={e => { e.stopPropagation(); onDelete(); }}
            title="Delete"
          >−</button>
        )}
        <div className="ing-card-info">
          <span className="ing-card-name">{ingredient.name}</span>
          {(ingredient.quantity || ingredient.unit) && (
            <span className="ing-card-qty">{ingredient.quantity} {ingredient.unit}</span>
          )}
        </div>
        <div className="ing-card-badges">
          {expiryBadge && (
            <span className="expiry-badge" style={{ color: expiryBadge.color, background: expiryBadge.bg }}>
              {expiryBadge.text}
            </span>
          )}
          <span className="perish-badge" style={{ color: perish.color, background: perish.bg }}>
            {perish.label}
          </span>
        </div>
      </div>

      {/* Stock level quick selector — hidden in edit mode */}
      {!editMode && (
        <div className="stock-level-bar">
          {STOCK_LEVELS.map(s => (
            <button
              key={s.id}
              className={`stock-bar-btn ${ingredient.stockLevel === s.id ? 'active' : ''}`}
              style={ingredient.stockLevel === s.id ? { background: s.bg, color: s.color, borderColor: s.color } : {}}
              onClick={() => onSetStock(s.id)}
              title={s.label}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
