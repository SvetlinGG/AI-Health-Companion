import { computed, Injectable } from '@angular/core';
import { single } from 'rxjs';

type User = { email: string, token: string};

@Injectable({ providedIn: 'root'})
export class AuthService {
  private userSig = single<User | null>(this.restore());
  readonly isAuthenticated = computed(() => !!this.userSig());

  login(email: string, password: string) {
    // TODO: replace with real API call
    const mockToken = 'mock-token-' + Math.random().toString(36).slice(2);
    const user = { email, token: mockToken };
    this.userSig.set(user);
    localStorage.setItem('auth_user', JSON.stringify(user));
    return true;
  }

  register(email: string, password: string) {
    // TODO: call real register endpoint
    return this.login(email, password);
  }

  logout() {
    this.userSig.set(null);
    localStorage.removeItem('auth_user');
  }

  user() { return this.userSig(); }

  private restore(): User | null {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  }

  constructor() { }
}
