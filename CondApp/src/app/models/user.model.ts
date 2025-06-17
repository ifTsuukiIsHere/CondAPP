export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  celular: string;
  casa: string;
  rol: 'usuario' | 'admin';
}
