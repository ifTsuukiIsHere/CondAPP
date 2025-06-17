import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { IonicModule, NavController, AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-crear-usuario',
  templateUrl: './crear-usuario.page.html',
  styleUrls: ['./crear-usuario.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class CrearUsuarioPage {
  usuarioForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private authService: AuthService,
    private alertCtrl: AlertController
  ) {
    // Validador personalizado para celular
    const validarCelular = (control: FormControl) => {
      const valor = control.value;
      // Remover todos los caracteres no numéricos
      const soloNumeros = valor.replace(/\D/g, '');
      // Verificar que tenga al menos 10 dígitos
      if (soloNumeros.length < 10) {
        return { 'minLength': true };
      }
      return null;
    };

    // Validador personalizado para RUT
    const validarRut = (control: FormControl) => {
      const rut = control.value?.replace(/\D/g, '');
      if (!rut) return null;
      
      // RUTs inválidos conocidos
      const rutsInvalidos = ['00000000', '11111111', '22222222'];
      if (rutsInvalidos.includes(rut)) {
        return { 'invalidRut': true };
      }
      
      // Validar dígito verificador
      const dv = rut[rut.length - 1];
      const num = rut.slice(0, -1);
      if (!num || !dv) return null;
      
      let suma = 0;
      let multiplicador = 2;
      
      for (let i = num.length - 1; i >= 0; i--) {
        suma += parseInt(num[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
      }
      
      const dvCalculado = 11 - (suma % 11);
      const dvValido = dvCalculado === 11 ? '0' : dvCalculado === 10 ? 'K' : dvCalculado.toString();
      
      if (dv.toUpperCase() !== dvValido) {
        return { 'invalidDv': true };
      }
      
      return null;
    };

    // Validador personalizado para casa
    const validarCasa = (control: FormControl) => {
      const valor = control.value;
      if (!valor) return null;
      
      // Solo debe ser número
      if (!/^[0-9]+$/.test(valor)) {
        return { 'invalidNumber': true };
      }
      
      // Rango válido (por ejemplo, 1-100)
      const numero = parseInt(valor);
      if (numero < 1 || numero > 100) {
        return { 'outOfRange': true };
      }
      
      return null;
    };

    // Validador personalizado para correo
    const validarCorreo = (control: FormControl) => {
      const valor = control.value;
      if (!valor) return null;
      
      // Dominios no permitidos
      const dominiosNoPermitidos = ['gmail.com', 'yahoo.com', 'hotmail.com'];
      const dominio = valor.split('@')[1];
      if (dominiosNoPermitidos.includes(dominio)) {
        return { 'invalidDomain': true };
      }
      
      // Validar formato básico
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
        return { 'invalidFormat': true };
      }
      
      return null;
    };

    this.usuarioForm = this.fb.group({
      rut: ['', [Validators.required, validarRut]],
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      celular: ['', [Validators.required, validarCelular]],
      casa: ['', [Validators.required, validarCasa]],
      correo: ['', [Validators.required, Validators.email, validarCorreo]]
    });

    // Suscribirse a cambios en el campo celular
    this.usuarioForm.get('celular')?.valueChanges.subscribe(valor => {
      // Si el valor es undefined o null, no hacer nada
      if (!valor) return;
      
      // Remover todos los caracteres no numéricos
      const soloNumeros = valor.replace(/\D/g, '');
      
      // Si hay menos de 9 dígitos, no agregar prefijo
      if (soloNumeros.length < 9) return;
      
      // Agregar prefijo +56 si no existe
      if (!soloNumeros.startsWith('56')) {
        this.usuarioForm.get('celular')?.setValue('+56' + soloNumeros);
      }
    });
  }

  async crearUsuario() {
    if (this.usuarioForm.invalid) {
      const errors: string[] = [];
      
      // Validar cada campo
      Object.keys(this.usuarioForm.controls).forEach(key => {
        const control = this.usuarioForm.get(key);
        if (control?.errors) {
          if (key === 'rut') {
            if (control.errors['invalidDv']) {
              errors.push('El dígito verificador del RUT es inválido');
            } else if (control.errors['invalidRut']) {
              errors.push('El RUT ingresado es inválido');
            }
          }
          
          if (key === 'casa') {
            if (control.errors['invalidNumber']) {
              errors.push('El número de casa debe ser un número');
            } else if (control.errors['outOfRange']) {
              errors.push('El número de casa debe estar entre 1 y 100');
            }
          }
          
          if (key === 'correo') {
            if (control.errors['invalidDomain']) {
              errors.push('No se permiten correos de Gmail, Yahoo o Hotmail');
            } else if (control.errors['invalidFormat']) {
              errors.push('El formato del correo electrónico es inválido');
            }
          }
          
          if (control.errors['required']) {
            errors.push(`El campo ${key} es requerido`);
          }
        }
      });
      
      if (errors.length > 0) {
        const alert = await this.alertCtrl.create({
          header: 'Errores de validación',
          message: errors.join('<br>'),
          buttons: ['OK']
        });
        await alert.present();
        return;
      }
    }

    const password = Math.random().toString(36).slice(-8);
    const data = { ...this.usuarioForm.value, password };

    this.authService.registrarUsuario(data).then(async () => {
      const alert = await this.alertCtrl.create({
        header: 'Usuario creado',
        message: `La contraseña temporal es: <strong>${password}</strong>`,
        buttons: ['OK']
      });
      await alert.present();
      this.navCtrl.navigateBack('/home');
    }).catch(err => {
      console.error('Error al crear usuario', err);
      const alert = this.alertCtrl.create({
        header: 'Error',
        message: err.message || 'Error al crear el usuario',
        buttons: ['OK']
      });
      alert.then(alert => alert.present());
    });
  }

  cancelar() {
    this.navCtrl.back();
  }
}
