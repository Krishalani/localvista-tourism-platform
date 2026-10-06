/** Mock auth is guest vs admin only — not production security. */
export type UserRole = 'Admin';

export interface AuthUser {
  username: string;
  displayName: string;
  role: UserRole;
}

export interface LoginResult {
  ok: boolean;
  user?: AuthUser;
}
