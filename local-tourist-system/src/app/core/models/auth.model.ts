export type UserRole = 'Admin' | 'Tourist';

export interface AuthUser {
  username: string;
  displayName: string;
  role: UserRole;
}

export interface LoginResult {
  ok: boolean;
  user?: AuthUser;
}
