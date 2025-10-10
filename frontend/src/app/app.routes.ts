import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    { path: 'login', loadComponent: () =>
      import('./pages/login/login/login.component').then(m => m.LoginComponent) },
    { path: 'register', loadComponent: () =>
      import('./pages/register/register/register.component').then(m => m.RegisterComponent) },

    { path: 'chat', canActivate: [authGuard], loadComponent: () =>
      import('./pages/chat/chat/chat.component').then(m => m.ChatComponent) },

    { path: 'dashboard', canActivate: [authGuard], loadComponent: () =>
      import('./pages/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent) },

    { path: '**', redirectTo: 'dashboard' }
];
