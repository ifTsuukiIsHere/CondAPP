import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-chat-libre',
  templateUrl: './chat-libre.page.html',
  styleUrls: ['./chat-libre.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ChatLibrePage {
  mensajeNuevo: string = '';
  mensajes = [
    { autor: 'Carlos', texto: 'Hola a todos 👋' },
    { autor: 'Ana', texto: '¿Quién va al asado del domingo?' }
  ];

  enviarMensaje() {
    if (this.mensajeNuevo.trim()) {
      this.mensajes.push({
        autor: 'Tú',
        texto: this.mensajeNuevo.trim()
      });
      this.mensajeNuevo = '';
    }
  }
}
