import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-chat-libre',
  templateUrl: './chat-libre.page.html',
  styleUrls: ['./chat-libre.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class ChatLibrePage {
  mensajeNuevo: string = '';
  mensajes = [
    { autor: 'Carlos', texto: 'Hola a todos 👋' },
    { autor: 'Ana', texto: '¿Quién va al asado del domingo?' }
  ];

  constructor(private navCtrl: NavController) {}

  goBack() {
    this.navCtrl.back();
  }

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