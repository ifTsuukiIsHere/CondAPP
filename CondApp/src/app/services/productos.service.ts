import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { getAuth, User } from '@angular/fire/auth';
import { Timestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private productosRef;

  constructor(private firestore: Firestore) {
    this.productosRef = collection(this.firestore, 'productos');
  }

  getProductos(): Observable<any[]> {
    return collectionData(this.productosRef, { idField: 'id' }) as Observable<any[]>;
  }

  crearProducto(producto: any) {
    // Asegurarse de que el usuario esté autenticado
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // Agregar el ID del usuario al producto
    const productoConUsuario = {
      ...producto,
      uid: user.uid,
      fechaCreacion: Timestamp.now()
    };

    return addDoc(this.productosRef, productoConUsuario);
  }

  async eliminarProducto(productoId: string): Promise<void> {
    const productoDocRef = doc(this.firestore, `productos/${productoId}`);
    await deleteDoc(productoDocRef);
  }
}
