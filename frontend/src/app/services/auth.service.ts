import { computed, Injectable, signal } from '@angular/core';

type User = { email: string, token: string};

@Injectable({ providedIn: 'root'})
export class AuthService {
  private userSig = signal<User | null>(this.restore());
  readonly isAuthenticated = computed(() => !!this.userSig());

  login(email: string, password: string) {
    try {
      // TODO: replace with real API call
      const mockToken = 'mock-token-' + Math.random().toString(36).slice(2);
      const user = { email, token: mockToken };
      this.userSig.set(user);
      localStorage.setItem('auth_user', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
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
    try {
      const raw = localStorage.getItem('auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('Failed to restore user:', error);
      return null;
    }
  }

  constructor() { }
}
