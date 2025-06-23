import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  collectionData, 
  orderBy, 
  query, 
  Timestamp,
  limit,
  startAfter,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
  QueryConstraint
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { Auth } from '@angular/fire/auth';

export interface Mensaje {
  id?: string;
  autor: string;
  autorId: string;
  numeroCasa?: string;  // Nuevo campo para el número de casa
  texto: string;
  fecha: Date | Timestamp;
  avatar?: string;
  estado?: 'enviando' | 'enviado' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private mensajesCollection = collection(this.firestore, 'mensajes');
  private lastVisible: QueryDocumentSnapshot<DocumentData> | null = null;
  private readonly LIMIT = 50;
  private mensajesSubject = new BehaviorSubject<Mensaje[]>([]);
  public mensajes$ = this.mensajesSubject.asObservable();

  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

  // Enviar un nuevo mensaje
  async enviarMensaje(mensaje: Omit<Mensaje, 'id' | 'fecha' | 'estado'>) {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // Crear mensaje temporal con estado 'enviando'
    const mensajeTemporal: Mensaje = {
      ...mensaje,
      id: 'temp-' + Date.now(),
      fecha: new Date(),
      estado: 'enviando'
    };

    // Agregar a la lista de mensajes localmente
    this.agregarMensajeLocal(mensajeTemporal);

    try {
      // Crear el mensaje para Firestore
      const nuevoMensaje: Omit<Mensaje, 'id' | 'estado'> = {
        ...mensaje,
        fecha: Timestamp.now()
      };
      
      // Enviar a Firestore
      const docRef = await addDoc(this.mensajesCollection, nuevoMensaje);
      
      // Actualizar el mensaje local con el ID real y estado 'enviado'
      this.actualizarMensajeLocal(mensajeTemporal.id, {
        id: docRef.id,
        estado: 'enviado',
        fecha: nuevoMensaje.fecha
      });
      
      return { id: docRef.id, ...nuevoMensaje };
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      // Actualizar el estado a error
      this.actualizarMensajeLocal(mensajeTemporal.id, {
        estado: 'error'
      });
      throw error;
    }
  }

  // Obtener mensajes en tiempo real
  obtenerMensajes(): Observable<Mensaje[]> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const q = query(
      this.mensajesCollection,
      orderBy('fecha', 'desc'),
      limit(this.LIMIT)
    );
    
    return new Observable(observer => {
      const unsubscribe = collectionData(q, { idField: 'id' }).subscribe({
        next: (mensajes: any[]) => {
          // Ordenar los mensajes por fecha (más antiguo primero)
          const mensajesOrdenados = [...mensajes].sort((a, b) => 
            a.fecha.seconds - b.fecha.seconds
          );
          
          // Convertir Timestamp a Date
          const mensajesConFecha = mensajesOrdenados.map(msg => ({
            ...msg,
            fecha: msg.fecha.toDate()
          }));
          
          // Actualizar el estado local
          this.mensajesSubject.next(mensajesConFecha);
          observer.next(mensajesConFecha);
        },
        error: (err) => {
          console.error('Error al obtener mensajes:', err);
          observer.error(err);
        },
        complete: () => observer.complete()
      });
      
      return () => unsubscribe.unsubscribe();
    });
  }

  // Métodos auxiliares para manejo local de mensajes
  private agregarMensajeLocal(mensaje: Mensaje) {
    const mensajesActuales = this.mensajesSubject.value;
    this.mensajesSubject.next([...mensajesActuales, mensaje]);
  }

  private actualizarMensajeLocal(mensajeId: string | undefined, cambios: Partial<Mensaje>) {
    if (!mensajeId) return;
    
    const mensajesActuales = this.mensajesSubject.value;
    const mensajeIndex = mensajesActuales.findIndex(m => m.id === mensajeId);
    
    if (mensajeIndex > -1) {
      const mensajesActualizados = [...mensajesActuales];
      mensajesActualizados[mensajeIndex] = {
        ...mensajesActualizados[mensajeIndex],
        ...cambios
      };
      this.mensajesSubject.next(mensajesActualizados);
    }
  }

  // Cargar más mensajes (paginación)
  async cargarMasMensajes(): Promise<Mensaje[]> {
    if (!this.lastVisible) return [];
    
    const q = query(
      this.mensajesCollection,
      orderBy('fecha', 'desc'),
      startAfter(this.lastVisible),
      limit(this.LIMIT)
    );
    
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        this.lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        
        const mensajes = querySnapshot.docs.map(doc => {
          const data = doc.data() as Omit<Mensaje, 'id'>;
          return {
            id: doc.id,
            ...data,
            fecha: data.fecha instanceof Timestamp ? data.fecha.toDate() : data.fecha
          };
        });
        
        return mensajes;
      }
      return [];
    } catch (error) {
      console.error('Error al cargar más mensajes:', error);
      throw error;
    }
  }
}
