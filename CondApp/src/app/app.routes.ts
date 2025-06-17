import { Routes } from '@angular/router';
import { adminGuard } from './guard/admin.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'gestionar-mis-reclamos',
    loadComponent: () => import('./pages/gestionar-mis-reclamos/gestionar-mis-reclamos.page').then( m => m.GestionarMisReclamosPage)
  },
  {
    path: 'comentarios',
    loadComponent: () => import('./componentes/comentarios/comentarios.page').then( m => m.ComentariosPage)
  },
  {
    path: 'chat-libre',
    loadComponent: () => import('./pages/chat-libre/chat-libre.page').then( m => m.ChatLibrePage)
  },
  {
    path: 'crear-anuncio',

    loadComponent: () => import('./pages/crear-anuncio/crear-anuncio.page').then( m => m.CrearAnuncioPage),
    canActivate: [adminGuard]
  },
  {
    path: 'crear-reclamo',
    loadComponent: () => import('./pages/crear-reclamo/crear-reclamo.page').then(m => m.CrearReclamoPage)
  },
  {
    path: 'crear-producto',
    loadComponent: () => import('./pages/crear-producto/crear-producto.page').then(m => m.CrearProductoPage)
  },
  {
    path: 'crear-usuario',
    loadComponent: () => import('./pages/crear-usuario/crear-usuario.page').then( m => m.CrearUsuarioPage),
    canActivate: [adminGuard]
  },
  {
    path: 'gestionar-reclamos',
    loadComponent: () => import('./pages/gestionar-reclamos/gestionar-reclamos.page').then( m => m.GestionarReclamosPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then( m => m.PerfilPage)
  },


];
