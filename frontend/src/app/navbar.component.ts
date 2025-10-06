import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  auth = computed( () => this.authService.isAuthenticated());
  go(path: string) {location.href = path;}
  logout() { this.authService.logout(); this.go('/login');}
}
