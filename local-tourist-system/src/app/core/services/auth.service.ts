import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'localvista.admin.session';

/** Hardcoded admin for UI mock — replaced by ASP.NET Identity later. */
const MOCK_ADMIN = {
  username: 'admin',
  password: 'Admin123',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authenticatedSignal = signal(this.readSession());

  readonly isAuthenticated = this.authenticatedSignal.asReadonly();

  login(username: string, password: string): boolean {
    const ok =
      username.trim() === MOCK_ADMIN.username &&
      password === MOCK_ADMIN.password;

    if (!ok) {
      this.authenticatedSignal.set(false);
      this.clearSession();
      return false;
    }

    this.authenticatedSignal.set(true);
    this.writeSession(true);
    return true;
  }

  logout(): void {
    this.authenticatedSignal.set(false);
    this.clearSession();
  }

  private readSession(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  }

  private writeSession(value: boolean): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (value) {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  private clearSession(): void {
    this.writeSession(false);
  }
}
