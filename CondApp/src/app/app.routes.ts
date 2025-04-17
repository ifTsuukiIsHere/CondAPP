import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'comentarios',
    loadComponent: () => import('./componentes/comentarios/comentarios.page').then( m => m.ComentariosPage)
  },
  {
    path: 'chat-libre',
    loadComponent: () => import('./pages/chat-libre/chat-libre.page').then( m => m.ChatLibrePage)
  },
];
