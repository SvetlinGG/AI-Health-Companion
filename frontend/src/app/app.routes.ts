import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

    { path: 'login', loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent) },
    { path: 'register', loadComponent: () =>
      import('./pages/register/register.component').then(m => m.RegisterComponent) },

    { path: 'chat', canActivate: [authGuard], loadComponent: () =>
      import('./pages/chat/chat.component').then(m => m.ChatComponent) },

    { path: 'dashboard', canActivate: [authGuard], loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },

    { path: '**', redirectTo: 'dashboard' }
];
