import type { AuthService } from './interfaces';
import type { UserProfile } from '../types';
import { makeId } from '../utils/format';

function nameFromContact(contact: string): string {
  const base = contact.includes('@') ? contact.split('@')[0] : 'Explorer';
  const cleaned = base.replace(/[._-]+/g, ' ').trim();
  return cleaned ? cleaned.replace(/\b\w/g, (c) => c.toUpperCase()) : 'Explorer';
}

/**
 * DEMO authentication. It accepts any well-formed credentials and verifies nothing.
 * Replace with the real authentication service (TODO(backend)) before releasing.
 */
export const authService: AuthService = {
  async signIn(contact) {
    const user: UserProfile = {
      id: makeId('demo-user'),
      fullName: nameFromContact(contact),
      contact: contact.trim(),
      isDemo: true,
    };
    return user;
  },
  async signUp(fullName, contact) {
    return { id: makeId('demo-user'), fullName: fullName.trim(), contact: contact.trim(), isDemo: true };
  },
  async signOut() {
    // Nothing to revoke while authentication is a demo.
  },
};
