import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-comentarios',
  templateUrl: './comentarios.page.html',
  styleUrls: ['./comentarios.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ComentariosPage implements OnInit {
  @Input() tipo!: string; // 'anuncio' o 'reclamo'
  @Input() item!: any;    // el anuncio o reclamo específico
  @Input() comentariosIniciales: { autor: string, texto: string }[] = [];

  comentarioNuevo: string = '';
  comentarios: { autor: string, texto: string }[] = [];

  constructor(private modalCtrl: ModalController) {}

  ngOnInit(): void {
    // Copiar comentarios recibidos desde el home
    this.comentarios = [...this.comentariosIniciales];
  }

  cerrar() {
    // Al cerrar devolvemos los comentarios actualizados al home
    this.modalCtrl.dismiss({
      comentarios: this.comentarios
    });
  }

  enviarComentario() {
    if (this.comentarioNuevo.trim()) {
      this.comentarios.push({
        autor: 'Tú',
        texto: this.comentarioNuevo.trim()
      });
      this.comentarioNuevo = '';
    }
  }
}
