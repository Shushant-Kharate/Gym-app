// AppShell.jsx — Premium bottom nav with gradient active indicator
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Salad, Activity, BarChart3, Settings } from 'lucide-react';

const TABS = [
  { path: '/',          label: 'Home',       icon: LayoutDashboard },
  { path: '/program',   label: 'Plan',       icon: Calendar },
  { path: '/nutrition', label: 'Fuel',       icon: Salad },
  { path: '/body',      label: 'Body',       icon: Activity },
  { path: '/analytics', label: 'Stats',      icon: BarChart3 },
  { path: '/settings',  label: 'Settings',   icon: Settings },
];

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {TABS.map(tab => {
        const Icon = tab.icon;
        const active = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            id={`nav-${tab.label.toLowerCase()}`}
            className={`nav-tab ${active ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={active ? 22 : 20} strokeWidth={active ? 2.3 : 1.6} />
            <span className="nav-tab-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <main className="page-content">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
