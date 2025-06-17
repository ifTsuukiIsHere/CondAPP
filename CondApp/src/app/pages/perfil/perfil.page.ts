import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, AlertController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class PerfilPage implements OnInit {
  perfilForm!: FormGroup;
  contrasenaForm!: FormGroup;
  usuario: any;
  isLoading = true;
  mostrandoCambioContrasena = false;

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private authService: AuthService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.cargarUsuario();
    this.inicializarFormularioContrasena();
  }

  async cargarUsuario() {
    try {
      this.usuario = await this.authService.getCurrentUser();
      
      this.perfilForm = this.fb.group({
        nombre: [this.usuario.displayName || '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        correo: [this.usuario.email, [Validators.required, Validators.email]],
        whatsapp: [this.usuario.whatsapp || '', [Validators.required]],
        casa: [this.usuario.casa || '', [Validators.required]]
      });
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      this.presentAlert('Error', 'No se pudo cargar los datos del usuario');
    } finally {
      this.isLoading = false;
    }
  }

  inicializarFormularioContrasena() {
    this.contrasenaForm = this.fb.group({
      contrasenaActual: ['', [Validators.required, Validators.minLength(6)]],
      nuevaContrasena: ['', [Validators.required, Validators.minLength(6)]],
      confirmarContrasena: ['', [Validators.required]]
    }, { validators: this.coincidenContrasenas });
  }

  coincidenContrasenas(group: FormGroup) {
    const nuevaContrasena = group.get('nuevaContrasena')?.value;
    const confirmarContrasena = group.get('confirmarContrasena')?.value;
    return nuevaContrasena === confirmarContrasena ? null : { noCoinciden: true };
  }

  async actualizar() {
    if (this.perfilForm.invalid) {
      this.presentAlert('Error', 'Por favor, complete todos los campos requeridos');
      return;
    }

    try {
      await this.authService.actualizarUsuario(this.perfilForm.value);
      
      const alert = await this.alertCtrl.create({
        header: 'Éxito',
        message: 'Perfil actualizado correctamente.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
              this.navCtrl.navigateBack('/home');
            }
          }
        ]
      });
      await alert.present();
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      this.presentAlert('Error', 'Error al actualizar el perfil. Por favor, inténtelo nuevamente.');
    }
  }

  async cambiarContrasena() {
    if (this.contrasenaForm.invalid) {
      this.presentAlert('Error', 'Por favor, complete todos los campos correctamente');
      return;
    }

    const { contrasenaActual, nuevaContrasena } = this.contrasenaForm.value;

    try {
      await this.authService.cambiarContrasena(contrasenaActual, nuevaContrasena);
      
      const alert = await this.alertCtrl.create({
        header: 'Éxito',
        message: 'Contraseña actualizada correctamente.',
        buttons: ['Aceptar']
      });
      
      await alert.present();
      this.mostrarCambioContrasena(false);
      this.contrasenaForm.reset();
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      let mensajeError = 'Error al cambiar la contraseña. Por favor, inténtelo nuevamente.';
      
      if (error.code === 'auth/wrong-password') {
        mensajeError = 'La contraseña actual es incorrecta.';
      } else if (error.code === 'auth/weak-password') {
        mensajeError = 'La nueva contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
      }
      
      this.presentAlert('Error', mensajeError);
    }
  }

  mostrarCambioContrasena(mostrar: boolean) {
    this.mostrandoCambioContrasena = mostrar;
    if (mostrar) {
      this.contrasenaForm.reset();
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  cancelar() {
    this.navCtrl.navigateBack('/home');
  }
}
