import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthUser, LoginResult } from '../models/auth.model';
import { environment } from '../../../environments/environment';

const SESSION_KEY = 'localvista.admin.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly userSignal = signal<AuthUser | null>(null);

  readonly currentUser = this.userSignal.asReadonly();
  readonly isAdmin = computed(() => this.userSignal()?.role === 'Admin');
  readonly isAuthenticated = this.isAdmin;

  /** Restore admin session from API cookie (browser only). */
  async initialize(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const user = await firstValueFrom(
        this.http.get<AuthUser | null>(`${environment.apiBaseUrl}/auth/me`),
      );
      if (user?.role === 'Admin') {
        this.userSignal.set(user);
        this.writeSession(user);
      } else {
        this.userSignal.set(null);
        this.clearSession();
      }
    } catch {
      this.userSignal.set(this.readSession());
    }
  }

  async login(username: string, password: string): Promise<LoginResult> {
    try {
      const result = await firstValueFrom(
        this.http.post<{ ok: boolean; user?: AuthUser; error?: string }>(
          `${environment.apiBaseUrl}/auth/login`,
          { username, password },
        ),
      );

      if (!result.ok || !result.user) {
        this.userSignal.set(null);
        this.clearSession();
        return { ok: false };
      }

      this.userSignal.set(result.user);
      this.writeSession(result.user);
      return { ok: true, user: result.user };
    } catch {
      this.userSignal.set(null);
      this.clearSession();
      return { ok: false };
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${environment.apiBaseUrl}/auth/logout`, {}));
    } catch {
      // Clear local session even if the API call fails.
    }

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
