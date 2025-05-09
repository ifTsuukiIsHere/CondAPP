import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';
import { doc, getDoc, updateDoc, arrayUnion,orderBy,query } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnunciosService {
  private anunciosRef;

  constructor(private firestore: Firestore) {
    this.anunciosRef = collection(this.firestore, 'anuncios');
  }

  crearAnuncio(anuncio: any) {
    return addDoc(this.anunciosRef, anuncio);
  }

  getAnuncios(): Observable<any[]> {
    return collectionData(this.anunciosRef, { idField: 'id' }) as Observable<any[]>;
  }

  darLike(anuncioId: string, userId: string) {
    const docRef = doc(this.firestore, 'anuncios', anuncioId);
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

  agregarComentario(anuncioId: string, comentario: { autor: string, texto: string }) {
    const comentariosRef = collection(this.firestore, `anuncios/${anuncioId}/comentarios`);
    return addDoc(comentariosRef, {
      ...comentario,
      fecha: new Date().toISOString()
    });
  }

  getComentarios(anuncioId: string) {
    const comentariosRef = collection(this.firestore, `anuncios/${anuncioId}/comentarios`);
    return collectionData(query(comentariosRef, orderBy('fecha')), { idField: 'id' });
  }
}
