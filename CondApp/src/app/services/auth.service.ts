import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, UserCredential } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

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
}
