import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController, ActionSheetController,AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { deleteDoc, doc,Firestore } from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';
import { AnunciosService } from '../services/anuncios.service';
import { ReclamosService } from '../services/reclamos.service';
import { ProductosService } from '../services/productos.service';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class HomePage implements OnInit {
  segmento = 'anuncios';
  rol!: 'usuario' | 'admin';

  anuncios$: Observable<any[]> | null = null;

  productos$: Observable<any[]> | null = null;


  reclamos: any[] = [];
  reclamosPendientesCount = 0;

  comentariosMap: { [id: string]: { autor: string, texto: string }[] } = {};


  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    public authService: AuthService,  // Cambiado a público para usarlo en la plantilla
    private actionSheetCtrl: ActionSheetController,
    private anunciosService: AnunciosService,
    private reclamosService: ReclamosService,
    private productosService: ProductosService,
    private firestore: Firestore,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.rol = this.authService.getRol() as 'usuario' | 'admin';
    console.log('Rol actual:', this.rol);
    this.anuncios$ = this.anunciosService.getAnuncios();
    this.productos$ = this.productosService.getProductos();
    this.reclamosService.getReclamos().subscribe(datos => {
      this.reclamos = datos;
      this.reclamosPendientesCount = datos.filter(d => d.estado === 'pendiente' || d.estado === 'nuevo').length;
    });
  }

  onLike(tipo: 'anuncio' | 'reclamo' | 'producto', item: any) {
    const uid = this.authService.getUID();
    if (tipo === 'anuncio') {
      this.anunciosService.darLike(item.id, uid).then(() => {
        console.log('👍 Like guardado para anuncio', item.id);
      });
    } else if (tipo === 'reclamo') {
      this.reclamosService.darLike(item.id, uid).then(() => {
        console.log('👍 Like guardado para reclamo', item.id);
      });
    } else {
      console.log('👍 Like para producto', item.id);
    }
  }


  async onComentar(tipo: 'anuncio' | 'reclamo' | 'producto', item: any) {
    const { ComentariosPage } = await import('../componentes/comentarios/comentarios.page');
    const id = item.id;
    const comentarios = this.comentariosMap[id] || [];
  
    const modal = await this.modalCtrl.create({
      component: ComentariosPage,
      componentProps: {
        tipo,
        item,
        comentariosIniciales: comentarios
      }
    });
  
    modal.onDidDismiss().then(result => {
      if (result.data?.comentarios) {
        this.comentariosMap[id] = result.data.comentarios;
      }
    });
  
    await modal.present();
  }
  
  
  onCompartir(tipo: 'anuncio' | 'reclamo', item: any) {
    console.log(`Compartir ${tipo}:`, item);
  }
  

  abrirChatLibre() {
    this.navCtrl.navigateForward('/chat-libre');
  }

  irCrearAnuncio() {
    this.navCtrl.navigateForward('/crear-anuncio');
  }

  irCrearReclamo() {
    this.navCtrl.navigateForward('/crear-reclamo');
  }

  irCrearProducto() {
    this.navCtrl.navigateForward('/crear-producto');
  }

  irGestionarMisReclamos() {
    this.navCtrl.navigateForward('/gestionar-mis-reclamos');
  }

  irGestionarReclamos() {
    this.navCtrl.navigateForward('/gestionar-reclamos');
  }

  irCrearUsuario() {
    this.navCtrl.navigateForward('/crear-usuario');
  }

  async mostrarMenuPerfil() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones de usuario',
      buttons: [
        {
          text: 'Modificar perfil',
          icon: 'create-outline',
          handler: () => this.modificarPerfil()
        },
        {
          text: 'Cerrar sesión',
          role: 'destructive',
          icon: 'log-out-outline',
          handler: () => this.logout()
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  logout() {
    this.authService.logout().then(() => {
      this.navCtrl.navigateRoot('/login');
    });
  }

  modificarPerfil() {
    console.log('Ir a modificar perfil');
    this.navCtrl.navigateForward('/perfil');
  }

  botonPanico() {
    console.warn('¡Botón de pánico activado! (pendiente de implementar)');
  }

  async eliminarProducto(producto: any) {
    const alerta = await this.alertCtrl.create({
      header: '¿Eliminar producto?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              await this.productosService.eliminarProducto(producto.id);
              console.log('Producto eliminado correctamente');
            } catch (error) {
              console.error('Error al eliminar el producto:', error);
              const errorAlerta = await this.alertCtrl.create({
                header: 'Error',
                message: 'No se pudo eliminar el producto. Por favor, inténtalo de nuevo.',
                buttons: ['Aceptar']
              });
              await errorAlerta.present();
            }
          }
        }
      ]
    });

    await alerta.present();
  }

  async editarAnuncio(anuncio: any) {
    const { EditarAnuncioComponent } = await import('../componentes/editar-anuncio/editar-anuncio.component');
  
    const modal = await this.modalCtrl.create({
      component: EditarAnuncioComponent,
      componentProps: {
        anuncio
      }
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data) {
        console.log('✅ Anuncio editado con éxito');
        // Aquí podrías volver a cargar anuncios si lo necesitas
      }
    });
  
    await modal.present();
  }
  
  
  async eliminarAnuncio(anuncioId: string) {
    const alerta = await this.alertCtrl.create({
      header: '¿Eliminar anuncio?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            const docRef = doc(this.firestore, 'anuncios', anuncioId);
            deleteDoc(docRef)
              .then(() => console.log('✅ Anuncio eliminado'))
              .catch(err => console.error('❌ Error al eliminar:', err));
          }
        }
      ]
    });
  
    await alerta.present();
  }
imagenSeleccionada: string | null = null;

abrirImagen(url: string) {
  this.imagenSeleccionada = url;
}

cerrarImagen() {
  this.imagenSeleccionada = null;
}
encodeURI(texto: string): string {
  return encodeURIComponent(texto);
}

}
