import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { DatePipe } from '@angular/common';

interface Mensaje {
  autor: string;
  texto: string;
  hora?: Date;
}

@Component({
  selector: 'app-chat-libre',
  templateUrl: './chat-libre.page.html',
  styleUrls: ['./chat-libre.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  providers: [DatePipe]
})
export class ChatLibrePage {
  mensajeNuevo: string = '';
  mensajes: Mensaje[] = [
    { autor: 'Carlos', texto: 'Hola a todos 👋', hora: new Date(Date.now() - 3600000) }, // Ejemplo: 1 hora atrás
    { autor: 'Ana', texto: '¿Quién va al asado del domingo?', hora: new Date(Date.now() - 1800000) } // 30 min atrás
  ];

  constructor(
    private navCtrl: NavController,
    private datePipe: DatePipe
  ) {}

  goBack() {
    this.navCtrl.back();
  }

  enviarMensaje() {
    const texto = this.mensajeNuevo.trim();
    if (texto) {
      this.mensajes.push({
        autor: 'Tú',
        texto: texto,
        hora: new Date() // Hora actual automáticamente
      });
      this.mensajeNuevo = '';
      
      // Opcional: Auto-scroll al último mensaje
      setTimeout(() => {
        const content = document.querySelector('ion-content');
        if (content) {
          content.scrollToBottom(300);
        }
      }, 100);
    }
  }

  // Método para formatear la hora (opcional)
  formatearHora(fecha?: Date): string {
    if (!fecha) return '';
    return this.datePipe.transform(fecha, 'shortTime') || '';
  }
}