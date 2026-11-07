import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

const PRIMARY_NAV: NavItem[] = [
  { to: '/', label: 'Overview', end: true },
  { to: '/users', label: 'Users' },
  { to: '/orders', label: 'Orders' },
];

const CONTENT_NAV: NavItem[] = [
  { to: '/stories', label: 'Stories' },
  { to: '/destinations', label: 'Destinations' },
  { to: '/events', label: 'Events' },
  { to: '/products', label: 'Products' },
  { to: '/artisans', label: 'Artisans' },
  { to: '/businesses', label: 'Businesses' },
  { to: '/learning', label: 'Learning' },
];

function navClass({ isActive }: { isActive: boolean }): string {
  return `nav-item${isActive ? ' nav-item--active' : ''}`;
}

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo" aria-hidden="true">
          CH
        </span>
        <span className="sidebar-brand-text">
          <span className="sidebar-title">CodeHills</span>
          <span className="sidebar-subtitle">Admin Console</span>
        </span>
      </div>

      <nav className="sidebar-nav">
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
            {item.label}
          </NavLink>
        ))}

        <div className="sidebar-section-label">Content</div>

        {CONTENT_NAV.map((item) => (
          <NavLink key={item.to} to={item.to} className={navClass}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
