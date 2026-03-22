import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { todayStr, formatDate } from '../utils/date';
import { useNavigate } from 'react-router-dom';
import './Today.css';

const SLOTS = ['breakfast', 'lunch', 'dinner'];

// suggestion state per slot: { recipe: obj|null, tried: bool, mode: string }
const EMPTY_SUGGESTION = { recipe: null, tried: false, mode: null };

export default function Today() {
  const { mealPlan, recipes, getDayWarnings, setMeal, suggestRecipe } = useApp();
  const today = todayStr();
  const slots = mealPlan[today] || {};
  const warnings = getDayWarnings(today);
  const navigate = useNavigate();

  const [suggestions, setSuggestions] = useState({});

  function getSuggestion(slot, mode) {
    const usedToday = Object.values(slots).flatMap(entries => entries.map(e => e.recipeId));
    const alreadySuggested = Object.values(suggestions).map(s => s?.recipe?.id).filter(Boolean);
    const recipe = suggestRecipe([...usedToday, ...alreadySuggested], slot, mode);
    setSuggestions(prev => ({ ...prev, [slot]: { recipe, tried: true, mode } }));
  }

  function reroll(slot) {
    const prev = suggestions[slot];
    getSuggestion(slot, prev?.mode || 'available');
  }

  function assignSuggestion(slot) {
    const s = suggestions[slot];
    if (s?.recipe) {
      setMeal(today, slot, s.recipe.id);
      setSuggestions(prev => ({ ...prev, [slot]: EMPTY_SUGGESTION }));
    }
  }

  return (
    <div className="today-page">
      <div className="today-header">
        <h1>Today</h1>
        <p className="today-date">{formatDate(today)}</p>
      </div>

      {warnings.length > 0 && (
        <div className="warnings-block">
          <h3 className="warnings-title">⚠️ Ingredient Warnings</h3>
          {warnings.map((w, i) => (
            <div key={i} className="warning-item">
              <strong>{capitalize(w.slot)}</strong> — {w.recipeName}
              <ul>
                {w.missing.map(m => (
                  <li key={m.id}>
                    <span className="missing-dot" />
                    {m.name} is not available
                    <button className="link-btn" onClick={() => navigate('/pantry')}>Fix in Pantry →</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="meals-grid">
        {SLOTS.map(slot => {
          const entries = slots[slot] || [];
          const slotWarnings = warnings.filter(w => w.slot === slot);
          const sug = suggestions[slot] || EMPTY_SUGGESTION;

          return (
            <div key={slot} className={`meal-card ${entries.length === 0 ? 'meal-card--empty' : ''} ${slotWarnings.length > 0 ? 'meal-card--warn' : ''}`}>
              <div className="meal-slot-label">{capitalize(slot)}</div>

              {entries.length > 0 ? (
                <>
                  {entries.map(({ rowId, recipeId }) => {
                    const r = recipes.find(x => x.id === recipeId);
                    const hasWarn = slotWarnings.some(w => w.recipeName === r?.name);
                    return (
                      <div key={rowId} className="meal-name">
                        {r?.name}
                        {hasWarn && <span className="meal-warn-badge"> · Missing ingredients</span>}
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="meal-empty-text">
                  Not planned
                  <button className="link-btn" onClick={() => navigate('/planner')}>Plan →</button>
                </div>
              )}

              {entries.length < 3 && (
                <div className="suggestion-area">
                  {/* Suggestion result */}
                  {sug.tried && sug.recipe && (
                    <div className="suggestion-card">
                      <div className="suggestion-card-top">
                        <span className="suggestion-label">
                          {sug.mode === 'available' ? '✓ Available' : '🎲 Anything'}
                        </span>
                        <button className="suggestion-reroll" onClick={() => reroll(slot)} title="Try another">↻</button>
                      </div>
                      <span className="suggestion-name">{sug.recipe.name}</span>
                      <button className="suggestion-use-btn" onClick={() => assignSuggestion(slot)}>
                        Use this
                      </button>
                    </div>
                  )}

                  {/* No recipe found */}
                  {sug.tried && !sug.recipe && (
                    <div className="suggestion-none">
                      No {sug.mode === 'available' ? 'available' : ''} recipes found
                    </div>
                  )}

                  {/* Suggest buttons */}
                  <div className="suggest-btns">
                    <button className="suggest-btn suggest-btn--available" onClick={() => getSuggestion(slot, 'available')}>
                      ✓ From available
                    </button>
                    <button className="suggest-btn suggest-btn--any" onClick={() => getSuggestion(slot, 'any')}>
                      🎲 Anything
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {SLOTS.every(s => (slots[s] || []).length > 0) && warnings.length === 0 && (
        <div className="all-planned">✓ All meals planned for today</div>
      )}
    </div>
  );
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
