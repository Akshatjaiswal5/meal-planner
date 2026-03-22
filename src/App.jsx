import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Today from './pages/Today';
import Planner from './pages/Planner';
import Recipes from './pages/Recipes';
import Pantry from './pages/Pantry';
import './index.css';

function AppShell() {
  const { loading, error, reload } = useApp();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12, color: 'var(--ink-3)', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', letterSpacing: '0.08em' }}>
        <div className="spinner" />
        loading
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
        <strong style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 400 }}>Could not connect</strong>
        <p style={{ color: 'var(--ink-3)', fontSize: '0.82rem', margin: 0 }}>{error}</p>
        <button className="btn-primary" onClick={reload}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/pantry" element={<Pantry />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppShell />
      </HashRouter>
    </AppProvider>
  );
}
