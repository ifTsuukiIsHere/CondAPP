import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AnunciosService } from '../../services/anuncios.service';

@Component({
  standalone: true,
  selector: 'app-crear-anuncio',
  templateUrl: './crear-anuncio.page.html',
  styleUrls: ['./crear-anuncio.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class CrearAnuncioPage implements OnInit {
  anuncioForm: FormGroup;
  rol: 'usuario' | 'admin' = 'usuario';

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private anunciosService: AnunciosService,
    private authService: AuthService
  ) {
    this.anuncioForm = this.fb.group({
      titulo: ['', Validators.required],
      mensaje: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.rol = this.authService.getRol() as 'usuario' | 'admin';
  }

  publicar() {
    if (!this.anuncioForm.valid) {
      console.warn('Formulario inválido');
      return;
    }
  
    const formValue = this.anuncioForm.value;
  
    const autor = this.rol === 'admin' ? 'Administrador' : 'Usuario';
  
    const anuncio = {
      titulo: formValue.titulo,
      mensaje: formValue.mensaje,
      fecha: new Date().toISOString(),
      autor: autor,
      rol: this.rol,
      casa: 'Casa 0',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(autor)}`,
      likes: 0,
      likedBy: []
    };
  
    console.log('📤 Enviando anuncio a Firebase:', anuncio);
  
    this.anunciosService.crearAnuncio(anuncio)
      .then(() => {
        console.log('✅ Anuncio guardado correctamente');
        this.navCtrl.navigateRoot('/home');
      })
      .catch(error => {
        console.error('❌ Error al guardar anuncio:', error);
      });
  }  
  cancelar() {
    this.navCtrl.navigateBack('/home');
  }
  
}
