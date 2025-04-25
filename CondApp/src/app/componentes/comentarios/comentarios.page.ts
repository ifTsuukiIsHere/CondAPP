import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, IonContent } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-comentarios',
  templateUrl: './comentarios.page.html',
  styleUrls: ['./comentarios.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ComentariosPage implements OnInit {
  @Input() tipo!: string;
  @Input() item!: any;
  @Input() comentariosIniciales: { autor: string, texto: string }[] = [];

  @ViewChild('content', { static: false }) content!: IonContent;

  comentarioNuevo: string = '';
  comentarios: { autor: string, texto: string }[] = [];

  constructor(private modalCtrl: ModalController) {}

  ngOnInit(): void {
    this.comentarios = [...this.comentariosIniciales];
  }

  cerrar() {
    this.modalCtrl.dismiss({
      comentarios: this.comentarios
    });
  }

  enviarComentario() {
    const texto = this.comentarioNuevo.trim();
    if (texto) {
      this.comentarios.push({
        autor: 'Tú',
        texto: texto
      });
      this.comentarioNuevo = '';
      setTimeout(() => {
        this.content.scrollToBottom(300);
      }, 100);
    }
  }
}
