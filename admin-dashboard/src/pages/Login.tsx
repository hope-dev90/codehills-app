import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/Button';
import { CheckboxField, TextField } from '../components/TextField';

export default function Login() {
  const { login, isAuthenticated, ready } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [ready, isAuthenticated, from, navigate]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await login(contact.trim(), password, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="login-brand">
          <span className="sidebar-logo" aria-hidden="true">
            CH
          </span>
          <h2 className="login-title">CodeHills Admin</h2>
          <p className="login-subtitle">Sign in with your administrator account.</p>
        </div>

        <form onSubmit={onSubmit} className="login-form">
          {error ? <p className="alert alert--error">{error}</p> : null}

          <TextField
            id="login-contact"
            label="Contact"
            value={contact}
            onChange={setContact}
            placeholder="email or phone"
            disabled={submitting}
          />
          <TextField
            id="login-password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Your password"
            disabled={submitting}
          />

          <CheckboxField
            label="Remember me"
            checked={rememberMe}
            onChange={setRememberMe}
            disabled={submitting}
          />

          <Button type="submit" disabled={submitting || !contact.trim() || !password}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
