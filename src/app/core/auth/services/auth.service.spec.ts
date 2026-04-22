import { TestBed } from '@angular/core/testing';
import { firstValueFrom, take } from 'rxjs';

import { AuthService } from './auth.service';

const STORAGE_KEY = 'ng-real-estate-deals.auth.user';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
  });

  it('login should authenticate with valid input and store user in localStorage', async () => {
    const ok = await firstValueFrom(service.login('pedro', 'secret').pipe(take(1)));

    expect(ok).toBe(true);
    expect(service.isAuthenticated()).toBe(true);

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw ?? '{}') as { id?: string; username?: string };
    expect(typeof parsed.id).toBe('string');
    expect(parsed.username).toBe('pedro');
  });

  it('logout should clear stored user and update authentication state', async () => {
    await firstValueFrom(service.login('pedro', 'secret').pipe(take(1)));
    expect(service.isAuthenticated()).toBe(true);

    service.logout();

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('isAuthenticated$ emits true when logged in and false when logged out', async () => {
    const states: boolean[] = [];
    const sub = service.isAuthenticated$.subscribe((v) => states.push(v));

    await firstValueFrom(service.login('pedro', 'secret').pipe(take(1)));
    service.logout();

    expect(states).toEqual([false, true, false]);
    sub.unsubscribe();
  });
});

