import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, IonContent } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AnunciosService } from 'src/app/services/anuncios.service';
import { ReclamosService } from 'src/app/services/reclamos.service';

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
  comentarios: { autor: string, texto: string, fecha?: string }[] = [];
  nuevoComentario: string = '';


  constructor(
    private modalCtrl: ModalController,
    private anunciosService: AnunciosService,
    private reclamosService: ReclamosService
  ) {}

  ngOnInit() {
    if (this.tipo === 'anuncio') {
      this.anunciosService.getComentarios(this.item.id).subscribe(coments => {
        this.comentarios = coments as { autor: string; texto: string; fecha?: string }[];
      });
    } else {
      this.reclamosService.getComentarios(this.item.id).subscribe(coments => {
        this.comentarios = coments as { autor: string; texto: string; fecha?: string }[];
      });
    }

  }

  agregarComentario() {
    const texto = this.nuevoComentario.trim();
    if (!texto) return;
  
    const comentario = {
      autor: 'Yo', // puedes reemplazar con el nombre real desde auth
      texto
    };
  
    if (this.tipo === 'anuncio') {
      this.anunciosService.agregarComentario(this.item.id, comentario).then(() => {
        this.nuevoComentario = '';
      });
    } else {
      this.reclamosService.agregarComentario(this.item.id, comentario).then(() => {
        this.nuevoComentario = '';
      });
    }
  }
  

  cerrar() {
    this.modalCtrl.dismiss({
      comentarios: this.comentarios
    });
  }

  
}
