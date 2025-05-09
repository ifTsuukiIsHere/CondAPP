import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavController, ActionSheetController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { AnunciosService } from '../services/anuncios.service';

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


  reclamos = [
    {
      id: 'r1',
      autor: 'Ana Torres',
      casa: 'Casa 5',
      fecha: 'Abril 12',
      mensaje: 'Hace una semana que hay una luz del pasillo que no funciona.',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent('Ana Torres')}`,
    },
    {
      id: 'r2',
      autor: 'Luis Pino',
      casa: 'Casa 17',
      fecha: 'Abril 11',
      mensaje: 'Vecinos dejando basura fuera de horario. Pido más fiscalización.',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent('Luis Pino')}`,
    }
  ];

  comentariosMap: { [id: string]: { autor: string, texto: string }[] } = {};


  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private authService: AuthService,
    private actionSheetCtrl: ActionSheetController,
    private anunciosService: AnunciosService
  ) {}

  ngOnInit() {
    this.rol = this.authService.getRol() as 'usuario' | 'admin';
    console.log('Rol actual:', this.rol);
    this.anuncios$ = this.anunciosService.getAnuncios();
  }

  onLike(tipo: 'anuncio' | 'reclamo', item: any) {
    if (tipo === 'anuncio') {
      const uid = this.authService.getUID();
      this.anunciosService.darLike(item.id, uid).then(() => {
        console.log('👍 Like guardado para anuncio', item.id);
      });
    }
  }
  
  
  async onComentar(tipo: 'anuncio' | 'reclamo', item: any) {
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

  irGestionarReclamos() {
    this.navCtrl.navigateForward('/gestionar-reclamos');
  }

  irGestionarMercado() {
    this.navCtrl.navigateForward('/gestionar-mercado');
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

  
}
