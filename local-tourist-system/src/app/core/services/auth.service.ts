import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthUser, LoginResult, UserRole } from '../models/auth.model';

const SESSION_KEY = 'localvista.auth.session';
const USERS_KEY = 'localvista.auth.users';

interface MockAccount {
  username: string;
  password: string;
  displayName: string;
  role: UserRole;
}

export interface SignUpInput {
  username: string;
  password: string;
  displayName: string;
}

export type SignUpResult =
  | { ok: true; user: AuthUser }
  | { ok: false; reason: 'duplicate' | 'invalid' };

/** Seeded accounts always available. Sign-up creates Tourist users. */
const SEED_ACCOUNTS: MockAccount[] = [
  {
    username: 'manager',
    password: 'Manager123',
    displayName: 'Nimal',
    role: 'Admin',
  },
  {
    username: 'user',
    password: 'User12345',
    displayName: 'Kavi',
    role: 'Tourist',
  },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly userSignal = signal<AuthUser | null>(this.readSession());
  private accounts: MockAccount[] = this.loadAccounts();

  readonly currentUser = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);
  readonly isAdmin = computed(() => this.userSignal()?.role === 'Admin');
  readonly isTourist = computed(() => this.userSignal()?.role === 'Tourist');

  login(username: string, password: string): LoginResult {
    this.accounts = this.loadAccounts();
    const account = this.accounts.find(
      (user) =>
        user.username.toLowerCase() === username.trim().toLowerCase() &&
        user.password === password,
    );

    if (!account) {
      this.userSignal.set(null);
      this.clearSession();
      return { ok: false };
    }

    const user: AuthUser = {
      username: account.username,
      displayName: account.displayName,
      role: account.role,
    };
    this.userSignal.set(user);
    this.writeSession(user);
    return { ok: true, user };
  }

  /** New accounts are always Tourist. Admin is seeded (manager), not self-registered. */
  signUp(input: SignUpInput): SignUpResult {
    const username = input.username.trim();
    const displayName = input.displayName.trim();
    const password = input.password;

    if (username.length < 3 || password.length < 6 || !displayName) {
      return { ok: false, reason: 'invalid' };
    }

    this.accounts = this.loadAccounts();
    const exists = this.accounts.some(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
    if (exists) {
      return { ok: false, reason: 'duplicate' };
    }

    const account: MockAccount = {
      username,
      password,
      displayName,
      role: 'Tourist',
    };
    this.accounts = [...this.accounts, account];
    this.persistAccounts();

    const user: AuthUser = {
      username: account.username,
      displayName: account.displayName,
      role: account.role,
    };
    this.userSignal.set(user);
    this.writeSession(user);
    return { ok: true, user };
  }

  logout(): void {
    this.userSignal.set(null);
    this.clearSession();
  }

  hasRole(role: UserRole): boolean {
    return this.userSignal()?.role === role;
  }

  private loadAccounts(): MockAccount[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [...SEED_ACCOUNTS];
    }
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (!raw) {
        return [...SEED_ACCOUNTS];
      }
      const stored = JSON.parse(raw) as MockAccount[];
      if (!Array.isArray(stored)) {
        return [...SEED_ACCOUNTS];
      }
      const byName = new Map<string, MockAccount>();
      for (const seed of SEED_ACCOUNTS) {
        byName.set(seed.username.toLowerCase(), seed);
      }
      for (const user of stored) {
        if (!user?.username || !user.password || !user.displayName) {
          continue;
        }
        const key = user.username.toLowerCase();
        if (!byName.has(key)) {
          byName.set(key, {
            ...user,
            role: user.role === 'Admin' ? 'Admin' : 'Tourist',
          });
        }
      }
      return [...byName.values()];
    } catch {
      return [...SEED_ACCOUNTS];
    }
  }

  private persistAccounts(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const custom = this.accounts.filter(
      (user) =>
        !SEED_ACCOUNTS.some(
          (seed) => seed.username.toLowerCase() === user.username.toLowerCase(),
        ),
    );
    localStorage.setItem(USERS_KEY, JSON.stringify(custom));
  }

  private readSession(): AuthUser | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as AuthUser;
      if (
        !parsed?.username ||
        (parsed.role !== 'Admin' && parsed.role !== 'Tourist')
      ) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private writeSession(user: AuthUser): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  private clearSession(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    sessionStorage.removeItem(SESSION_KEY);
  }
}
