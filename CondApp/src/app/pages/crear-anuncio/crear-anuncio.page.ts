import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-crear-anuncio',
  templateUrl: './crear-anuncio.page.html',
  styleUrls: ['./crear-anuncio.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class CrearAnuncioPage {
  anuncioForm: FormGroup;

  constructor(private fb: FormBuilder, private navCtrl: NavController) {
    this.anuncioForm = this.fb.group({
      titulo: ['', Validators.required],
      mensaje: ['', Validators.required]
    });
  }

  publicar() {
    if (this.anuncioForm.valid) {
      const nuevoAnuncio = this.anuncioForm.value;
      console.log('Anuncio creado:', nuevoAnuncio);

      // Aquí más adelante guardarás en Firebase
      this.navCtrl.navigateRoot('/home'); // Vuelve al home después de publicar
    }
  }

  cancelar() {
    this.navCtrl.navigateBack('/home');
  }
}
