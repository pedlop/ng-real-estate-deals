import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, distinctUntilChanged, map, of } from 'rxjs';

const STORAGE_KEY = 'ng-real-estate-deals.auth.user';

export interface User {
  id: string;
  username: string;
}

function isUserRecord(value: unknown): value is User {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const r = value as Record<string, unknown>;
  return typeof r['id'] === 'string' && typeof r['username'] === 'string';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly userSubject = new BehaviorSubject<User | null>(this.readStoredUser());

  readonly user$: Observable<User | null> = this.userSubject.asObservable();

  readonly isAuthenticated$: Observable<boolean> = this.userSubject.pipe(
    map((user) => user !== null),
    distinctUntilChanged(),
  );

  /** Synchronous check for guards, dialogs, and continuation flows. */
  isAuthenticated(): boolean {
    return this.userSubject.getValue() !== null;
  }

  login(username: string, password: string): Observable<boolean> {
    const u = username.trim();
    const p = password.trim();
    if (!u || !p) {
      return of(false);
    }

    const user: User = {
      id: globalThis.crypto?.randomUUID?.() ?? `user-${Date.now()}`,
      username: u,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.userSubject.next(user);

    return of(true);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.userSubject.next(null);
  }

  private readStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed: unknown = JSON.parse(raw);
      return isUserRecord(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
}
