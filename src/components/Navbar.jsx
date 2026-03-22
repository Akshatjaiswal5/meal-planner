import { NavLink } from 'react-router-dom';
import './Navbar.css';

const links = [
  { to: '/', label: 'Today', icon: '☀️' },
  { to: '/planner', label: 'Planner', icon: '📅' },
  { to: '/recipes', label: 'Recipes', icon: '📖' },
  { to: '/pantry', label: 'Pantry', icon: '🧺' },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">Meal Planner</div>
      <ul className="navbar-links">
        {links.map(l => (
          <li key={l.to}>
            <NavLink to={l.to} end={l.to === '/'} className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="nav-icon">{l.icon}</span>
              <span className="nav-label">{l.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
