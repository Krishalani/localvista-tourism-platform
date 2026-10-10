/** The public app supports guest access and the Admin role only. */
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
