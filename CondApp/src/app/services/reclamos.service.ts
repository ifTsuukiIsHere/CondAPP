import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';
import { doc, getDoc, updateDoc, arrayUnion, orderBy, query, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReclamosService {
  private reclamosRef;

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {
    this.reclamosRef = collection(this.firestore, 'reclamos');
  }

  async crearReclamo(reclamo: any) {
    try {
      // Obtener el usuario actual
      const user = await this.authService.getCurrentUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Crear el reclamo con los datos del usuario
      // Formatear el número de casa para incluir el prefijo 'Casa ' si no lo tiene
      const numeroCasa = user.casa ? (user.casa.startsWith('Casa ') ? user.casa : `Casa ${user.casa}`) : 'Casa no especificada';
      
      const reclamoConUsuario = {
        ...reclamo,
        autor: user.displayName,
        casa: numeroCasa,
        fecha: new Date().toISOString(),
        estado: 'pendiente',
        likes: 0,
        likedBy: [],
        userId: user.uid  // Agregar el ID del usuario para referencia
      };

      console.log('Creando reclamo con datos:', reclamoConUsuario);
      return await addDoc(this.reclamosRef, reclamoConUsuario);
    } catch (error) {
      console.error('Error en crearReclamo:', error);
      throw error;
    }
  }

  getReclamos(): Observable<any[]> {
    return collectionData(this.reclamosRef, { idField: 'id' }) as Observable<any[]>;
  }


  darLike(reclamoId: string, userId: string) {
    const docRef = doc(this.firestore, 'reclamos', reclamoId);
    return getDoc(docRef).then(docSnap => {
      if (!docSnap.exists()) return;

      const data = docSnap.data();
      const yaDioLike = (data['likedBy'] || []).includes(userId);
      if (yaDioLike) return;

      return updateDoc(docRef, {
        likes: (data['likes'] || 0) + 1,
        likedBy: arrayUnion(userId)
      });
    });
  }

  async actualizarEstadoReclamo(reclamoId: string, nuevoEstado: string) {
    const reclamoRef = doc(this.firestore, 'reclamos', reclamoId);
    return updateDoc(reclamoRef, { estado: nuevoEstado });
  }

  async actualizarEstado(reclamoId: string, nuevoEstado: string, usuario: string) {
    const docRef = doc(this.firestore, 'reclamos', reclamoId);
    return getDoc(docRef).then(docSnap => {
      if (!docSnap.exists()) return;

      return updateDoc(docRef, {
        estado: nuevoEstado,
        historial: arrayUnion({ estado: nuevoEstado, fecha: new Date().toISOString(), usuario })
      });
    });
  }

  agregarComentario(reclamoId: string, comentario: { autor: string; texto: string }) {
    const comentariosRef = collection(this.firestore, `reclamos/${reclamoId}/comentarios`);
    return addDoc(comentariosRef, {
      ...comentario,
      fecha: new Date().toISOString()
    });
  }

  getComentarios(reclamoId: string) {
    const comentariosRef = collection(this.firestore, `reclamos/${reclamoId}/comentarios`);
    return collectionData(query(comentariosRef, orderBy('fecha')), { idField: 'id' });
  }

  // Método para eliminar un reclamo si el usuario es el propietario o un administrador
  async eliminarReclamo(reclamoId: string, userId: string, userRol: string): Promise<boolean> {
    try {
      // Primero verificar que el reclamo existe
      const reclamoRef = doc(this.firestore, 'reclamos', reclamoId);
      const reclamoSnap = await getDoc(reclamoRef);
      
      if (!reclamoSnap.exists()) {
        throw new Error('El reclamo no existe');
      }
      
      const reclamoData = reclamoSnap.data();
      // Permitir eliminar si es el propietario o un administrador
      if (userRol !== 'admin' && reclamoData['userId'] !== userId) {
        throw new Error('No tienes permiso para eliminar este reclamo');
      }
      
      // Si llegamos aquí, el usuario tiene permiso, proceder a eliminar
      await deleteDoc(reclamoRef);
      return true;
    } catch (error) {
      console.error('Error al eliminar el reclamo:', error);
      throw error;
    }
  }
}
