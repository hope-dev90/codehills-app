import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Overview',
  '/users': 'Users',
  '/orders': 'Orders',
  '/stories': 'Stories',
  '/destinations': 'Destinations',
  '/events': 'Events',
  '/products': 'Products',
  '/artisans': 'Artisans',
  '/businesses': 'Businesses',
  '/learning': 'Learning',
};

export default function Layout() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? 'Admin';

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar title={title} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
