import { useAuth } from '../auth/AuthContext';
import { Button } from './Button';

export function Topbar({ title }: { title: string }) {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-right">
        {user ? (
          <span className="topbar-user">
            <span className="topbar-user-name">{user.fullName}</span>
            <span className="topbar-user-role">{user.role}</span>
          </span>
        ) : null}
        <Button variant="secondary" size="sm" onClick={logout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
