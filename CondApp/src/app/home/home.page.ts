import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { NavController } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonicModule, CommonModule,FormsModule],
})
export class HomePage {
  segmento = 'anuncios';
  // 'anuncios' o 'reclamos'
  rol: 'usuario' | 'admin' = 'admin'; // Cambia a 'admin' para ver la vista de administrador
  // Cambia a 'admin' para ver la vista de administrador
  // En una app real, esto vendría del servicio de autenticación o del estado global de la app.
  anuncios = [
    {
      id : 'a1',
      autor: 'Carlos Méndez',
      rol: 'Consejero',
      casa: 'Casa 12',
      fecha: 'Abril 10',
      mensaje: `🔔 Notificación importante del condominio...`,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent('Carlos Méndez')}`,
    }
  ];

  reclamos = [
    {
      id : 'r1',
      autor: 'Ana Torres',
      casa: 'Casa 5',
      fecha: 'Abril 12',
      mensaje: 'Hace una semana que hay una luz del pasillo que no funciona.',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent('Ana Torres')}`,
    },
    {
      id : 'r2',
      autor: 'Luis Pino',
      casa: 'Casa 17',
      fecha: 'Abril 11',
      mensaje: 'Vecinos dejando basura fuera de horario. Pido más fiscalización.',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent('Luis Pino')}`,
    }
  ];
  comentariosMap: { [key: string]: { autor: string, texto: string }[] } = {
    a1: [
      { autor: 'Luis', texto: '¡De acuerdo con esto!' }
    ],
    r1: [
      { autor: 'Claudio', texto: 'Ese problema lleva días' }
    ]
  };
  
  constructor(private modalCtrl: ModalController,private navCtrl: NavController) {}

  onLike(tipo: 'anuncio' | 'reclamo', item: any) {
    console.log(`Like en ${tipo}:`, item);
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

}
