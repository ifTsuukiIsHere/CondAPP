import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, UserCredential, createUserWithEmailAndPassword, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore) {}

  login(email: string, password: string): Promise<{ user: UserCredential, rol: string }> {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then(async (userCredential) => {
        const uid = userCredential.user.uid;
        const docRef = doc(this.firestore, 'usuarios', uid);
        const docSnap = await getDoc(docRef);

        console.log('🧠 Datos de Firestore:', docSnap.data());

        let rol = 'usuario';
        if (docSnap.exists()) {
          const data = docSnap.data();
          rol = typeof data['rol'] === 'string' ? data['rol'] : 'usuario';
        }

        localStorage.setItem('uid', uid);
        localStorage.setItem('rol', rol);

        return { user: userCredential, rol };
      });
  }

  logout() {
    localStorage.removeItem('rol');
    localStorage.removeItem('uid');
    return signOut(this.auth);
  }

  getRol(): string {
    return localStorage.getItem('rol') || 'usuario';
  }

  getUID(): string {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');
    return user.uid;
  }

  getNombreUsuario(): string | null {
    const user = this.auth.currentUser;
    if (!user) return null;
    return user.displayName || user.email?.split('@')[0] || null;
  }

  async getCasaUsuario(): Promise<string> {
    const uid = this.getUID();
    const docRef = doc(this.firestore, 'usuarios', uid);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data?.['casa'] || 'Casa 0';
      }
    } catch (error) {
      console.error('Error al obtener la casa del usuario:', error);
    }
    return 'Casa 0';
  }

  getAvatarUsuario(): string | null {
    const user = this.auth.currentUser;
    if (!user) return null;
    return user.photoURL || null;
  }

  async getCurrentUser() {
    const user = this.auth.currentUser;
    if (!user) return null;
    
    const docRef = doc(this.firestore, 'usuarios', user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || userData['nombre'] || 'Usuario',
        casa: userData['casa'] || 'Sin número de casa',
        rol: userData['rol'] || 'usuario',
        whatsapp: userData['whatsapp'] || userData['celular'] || null // Intenta obtener primero whatsapp, luego celular
      };
    }
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Usuario',
      casa: 'Sin número de casa',
      rol: 'usuario'
    };
  }

  registrarUsuario(data: { rut: string; nombre: string; celular: string; casa: string; correo: string; password: string }) {
    return createUserWithEmailAndPassword(this.auth, data.correo, data.password)
      .then(cred => {
        const uid = cred.user.uid;
        const docRef = doc(this.firestore, 'usuarios', uid);
        return setDoc(docRef, {
          rut: data.rut,
          nombre: data.nombre,
          whatsapp: data.celular,
          casa: data.casa,
          correo: data.correo,
          rol: 'usuario'
        });
      });
  }

  async cambiarContrasena(contrasenaActual: string, nuevaContrasena: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !user.email) {
      throw new Error('Usuario no autenticado');
    }

    // Reautenticar al usuario
    const credential = EmailAuthProvider.credential(user.email, contrasenaActual);
    await reauthenticateWithCredential(user, credential);

    // Cambiar la contraseña
    return updatePassword(user, nuevaContrasena);
  }

  async actualizarUsuario(data: { nombre?: string; whatsapp?: string; casa?: string; correo?: string }) {
    const uid = this.getUID();
    const docRef = doc(this.firestore, 'usuarios', uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Usuario no encontrado');
    }

    // Obtener los datos actuales
    const userData = docSnap.data();
    
    // Actualizar solo los campos proporcionados
    const updateData: any = {};
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp;
    if (data.casa !== undefined) updateData.casa = data.casa;
    if (data.correo !== undefined) updateData.correo = data.correo;

    // Actualizar el documento
    return updateDoc(docRef, updateData);
  }
}
