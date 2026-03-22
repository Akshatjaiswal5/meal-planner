import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MEAL_TYPES } from './Recipes';
import { todayStr, tomorrowStr, weekDates, getMondayOfWeek, formatDate } from '../utils/date';
import './Planner.css';

const SLOTS = ['breakfast', 'lunch', 'dinner'];

export default function Planner() {
  const { mealPlan, recipes, setMeal, clearMeal, getDayWarnings, suggestRecipe } = useApp();
  const [mode, setMode] = useState('week'); // 'week' | 'tomorrow'
  const [weekStart, setWeekStart] = useState(() => getMondayOfWeek(todayStr()));
  const [pickerState, setPickerState] = useState(null); // { date, slot }

  const today = todayStr();
  const tomorrow = tomorrowStr();
  const dates = mode === 'week' ? weekDates(weekStart) : [tomorrow];

  function prevWeek() {
    const d = new Date(weekStart + 'T00:00:00');
    d.setDate(d.getDate() - 7);
    setWeekStart(d.toISOString().slice(0, 10));
  }

  function nextWeek() {
    const d = new Date(weekStart + 'T00:00:00');
    d.setDate(d.getDate() + 7);
    setWeekStart(d.toISOString().slice(0, 10));
  }

  function openPicker(date, slot) {
    setPickerState({ date, slot });
  }

  function pickRecipe(recipeId) {
    if (!pickerState || recipeId === null) { setPickerState(null); return; }
    setMeal(pickerState.date, pickerState.slot, recipeId);
    setPickerState(null);
  }

  return (
    <div className="planner-page">
      <div className="planner-header">
        <h1>Planner</h1>
        <div className="planner-tabs">
          <button className={mode === 'week' ? 'tab active' : 'tab'} onClick={() => setMode('week')}>Week</button>
          <button className={mode === 'tomorrow' ? 'tab active' : 'tab'} onClick={() => setMode('tomorrow')}>Tomorrow</button>
        </div>
      </div>

      {mode === 'week' && (
        <div className="week-nav">
          <button onClick={prevWeek} className="week-arrow">←</button>
          <span className="week-range">{formatDate(weekStart)} – {formatDate(dates[6])}</span>
          <button onClick={nextWeek} className="week-arrow">→</button>
        </div>
      )}

      <div className="planner-scroll-wrap">
      <div className={`planner-grid ${mode === 'tomorrow' ? 'planner-grid--single' : ''}`}>
        {dates.map(date => {
          const slots = mealPlan[date] || {};
          const warnings = getDayWarnings(date);
          const isToday = date === today;
          const isTomorrow = date === tomorrow;

          return (
            <div key={date} className={`day-col ${isToday ? 'day-col--today' : ''}`}>
              <div className="day-header">
                <span className="day-label">{formatDate(date)}</span>
                {isToday && <span className="today-badge">Today</span>}
                {isTomorrow && <span className="tomorrow-badge">Tomorrow</span>}
                {warnings.length > 0 && <span className="warn-badge" title="Missing ingredients">⚠️</span>}
              </div>
              {SLOTS.map(slot => {
                const entries = slots[slot] || [];
                const hasWarn = warnings.some(w => w.slot === slot);
                const canAdd = entries.length < 3;

                return (
                  <div
                    key={slot}
                    className={`slot-cell ${hasWarn ? 'slot-cell--warn' : ''}`}
                  >
                    <span className="slot-label">{capitalize(slot)}</span>
                    {entries.map(({ rowId, recipeId }) => {
                      const recipe = recipes.find(r => r.id === recipeId);
                      return (
                        <div key={rowId} className="slot-recipe-row">
                          <span className="slot-recipe">{recipe?.name}</span>
                          <button className="slot-remove-btn" onClick={() => clearMeal(date, slot, rowId)} title="Remove">×</button>
                        </div>
                      );
                    })}
                    {canAdd && (
                      <button className="slot-add-btn" onClick={() => openPicker(date, slot)}>
                        + Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      </div>

      {pickerState && (
        <RecipePicker
          recipes={recipes}
          date={pickerState.date}
          slot={pickerState.slot}
          selectedIds={(mealPlan[pickerState.date]?.[pickerState.slot] || []).map(e => e.recipeId)}
          onPick={pickRecipe}
          onClose={() => setPickerState(null)}
          onSuggest={(mode) => suggestRecipe(
            Object.values(mealPlan[pickerState.date] || {}).flatMap(entries => entries.map(e => e.recipeId)),
            pickerState.slot, mode
          )}
        />
      )}
    </div>
  );
}

const SLOT_TYPE_MAP = { breakfast: ['breakfast', 'any'], lunch: ['lite', 'any'], dinner: ['dinner', 'any'] };

// suggestion state: { recipe, tried, mode }
const EMPTY_SUG = { recipe: null, tried: false, mode: null };

function RecipePicker({ recipes, date, slot, selectedIds = [], onPick, onClose, onSuggest }) {
  const [search, setSearch] = useState('');
  const [sug, setSug] = useState(EMPTY_SUG);
  const [showAll, setShowAll] = useState(false);

  const allowed = SLOT_TYPE_MAP[slot] || ['any'];
  const slotFiltered = showAll ? recipes : recipes.filter(r => allowed.includes(r.mealType));
  const filtered = slotFiltered.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  function handleSuggest(mode) {
    const recipe = onSuggest(mode);
    setSug({ recipe, tried: true, mode });
  }

  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="picker-modal" onClick={e => e.stopPropagation()}>
        <div className="picker-header">
          <h3>Pick recipe — {capitalize(slot)}, {formatDate(date)}</h3>
          <button className="picker-close" onClick={onClose}>✕</button>
        </div>

        {/* Suggest buttons */}
        <div className="picker-suggest-row">
          <button className="picker-suggest-btn picker-suggest-btn--avail" onClick={() => handleSuggest('available')}>
            ✓ From available
          </button>
          <button className="picker-suggest-btn picker-suggest-btn--any" onClick={() => handleSuggest('any')}>
            🎲 Anything
          </button>
        </div>

        {/* Suggestion result */}
        {sug.tried && sug.recipe && (
          <div className="picker-suggestion" onClick={() => { onPick(sug.recipe.id); setSug(EMPTY_SUG); }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="picker-suggestion-label">{sug.mode === 'available' ? '✓ Available pick' : '🎲 Random pick'}</span>
              <button className="picker-reroll" onClick={e => { e.stopPropagation(); handleSuggest(sug.mode); }} title="Try another">↻</button>
            </div>
            <span className="picker-suggestion-name">{sug.recipe.name}</span>
            <span className="picker-suggestion-hint">Click to use</span>
          </div>
        )}
        {sug.tried && !sug.recipe && (
          <div className="picker-suggest-none">
            No {sug.mode === 'available' ? 'available' : ''} recipes found for this slot
          </div>
        )}

        <div className="picker-filter-row">
          <input
            className="picker-search"
            placeholder="Search recipes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <button className={`picker-showall ${showAll ? 'active' : ''}`} onClick={() => setShowAll(a => !a)}>
            {showAll ? 'Slot filter on' : 'Show all'}
          </button>
        </div>
        <ul className="picker-list">
          {filtered.length === 0 && (
            <li className="picker-empty">
              {recipes.length === 0 ? 'No recipes yet. Add some in the Recipes tab.' : 'No matching recipes for this slot.'}
            </li>
          )}
          {filtered.map(r => {
            const mt = MEAL_TYPES.find(m => m.id === r.mealType);
            const isSelected = selectedIds.includes(r.id);
            return (
              <li
                key={r.id}
                className={`picker-item ${isSelected ? 'picker-item--active' : ''}`}
                onClick={() => !isSelected && onPick(r.id)}
                style={isSelected ? { opacity: 0.5, cursor: 'default' } : {}}
              >
                <span>{r.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {mt && <span className="picker-type-badge" style={{ color: mt.color, background: mt.bg }}>{mt.icon} {mt.label}</span>}
                  {isSelected && <span className="picker-check">✓</span>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
