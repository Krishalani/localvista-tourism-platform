import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, tap } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { LoginResponse } from './models';
import { readSession, writeSession } from './session-store';

const STORAGE_KEY = 'admin-session';

/** Administrator session (FR-14 to FR-16). The token is kept only for the browser session. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = signal<LoginResponse | null>(readSession<LoginResponse>(STORAGE_KEY));

  readonly username = computed(() => this.session()?.username ?? null);
  readonly isLoggedIn = computed(() => this.token() !== null);

  /** The bearer token, or null when nobody is logged in or the token has expired. */
  token(): string | null {
    const session = this.session();
    if (!session || new Date(session.expiresAtUtc).getTime() <= Date.now()) {
      return null;
    }
    return session.token;
  }

  login(username: string, password: string): Observable<void> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, { username, password }).pipe(
      tap((session) => this.setSession(session)),
      map(() => undefined),
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/auth/logout`, null).pipe(
      catchError(() => of(undefined)),
      finalize(() => this.clear()),
    );
  }

  /** Forgets the session locally, e.g. after the API rejects an expired token. */
  clear(): void {
    this.setSession(null);
  }

  private setSession(session: LoginResponse | null): void {
    this.session.set(session);
    writeSession(STORAGE_KEY, session);
  }
}
