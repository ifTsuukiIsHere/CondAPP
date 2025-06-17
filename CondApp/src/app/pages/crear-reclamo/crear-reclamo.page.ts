import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ReclamosService } from '../../services/reclamos.service';

@Component({
  standalone: true,
  selector: 'app-crear-reclamo',
  templateUrl: './crear-reclamo.page.html',
  styleUrls: ['./crear-reclamo.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class CrearReclamoPage implements OnInit {
  reclamoForm: FormGroup;
  rol: 'usuario' | 'admin' = 'usuario';

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private reclamosService: ReclamosService,
    private authService: AuthService
  ) {
    this.reclamoForm = this.fb.group({
      mensaje: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.rol = this.authService.getRol() as 'usuario' | 'admin';
  }

  enviar() {
    if (!this.reclamoForm.valid) {
      return;
    }

    const formValue = this.reclamoForm.value;
    const autor = this.rol === 'admin' ? 'Administrador' : 'Usuario';

    const reclamo = {
      mensaje: formValue.mensaje,
      fecha: new Date().toISOString(),
      autor,
      rol: this.rol,
      casa: 'Casa 0',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(autor)}`,
      estado: 'nuevo',
      likes: 0,
      likedBy: []
    };

    this.reclamosService.crearReclamo(reclamo)
      .then(() => this.navCtrl.navigateRoot('/home'))
      .catch(err => console.error('Error al crear reclamo', err));
  }

  cancelar() {
    this.navCtrl.navigateBack('/home');
  }
}
