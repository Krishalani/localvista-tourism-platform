import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthUser, LoginResult } from '../models/auth.model';

const SESSION_KEY = 'localvista.admin.session';

/**
 * Frontend-only mock admin sign-in.
 * Demo credentials are intentional for UI walkthroughs — replace with ASP.NET Identity later.
 * There is no tourist registration or tourist sign-in.
 */
const DEMO_ADMIN = {
  username: 'manager',
  password: 'Manager123',
  displayName: 'Nimal (demo admin)',
} as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly userSignal = signal<AuthUser | null>(this.readSession());

  readonly currentUser = this.userSignal.asReadonly();
  /** True when the demo admin session is active. */
  readonly isAdmin = computed(() => this.userSignal()?.role === 'Admin');
  /** Alias kept for templates that ask “signed in?” — only admins can sign in. */
  readonly isAuthenticated = this.isAdmin;

  login(username: string, password: string): LoginResult {
    const ok =
      username.trim().toLowerCase() === DEMO_ADMIN.username &&
      password === DEMO_ADMIN.password;

    if (!ok) {
      this.userSignal.set(null);
      this.clearSession();
      return { ok: false };
    }

    const user: AuthUser = {
      username: DEMO_ADMIN.username,
      displayName: DEMO_ADMIN.displayName,
      role: 'Admin',
    };
    this.userSignal.set(user);
    this.writeSession(user);
    return { ok: true, user };
  }

  logout(): void {
    this.userSignal.set(null);
    this.clearSession();
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
      if (!parsed?.username || parsed.role !== 'Admin') {
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
