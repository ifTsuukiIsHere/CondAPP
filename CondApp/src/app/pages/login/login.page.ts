import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class LoginPage {
  loginForm: FormGroup;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }  
  
  onLogin() {
    const { email, password } = this.loginForm.value;
  
    this.authService.login(email, password)
    .then(({ rol }) => {
      console.log('Login exitoso con rol:', rol);
      this.navCtrl.navigateRoot('/home');
    })
    .catch((error) => {
      console.error('Error al iniciar sesión:', error);
      this.error = 'Correo o contraseña incorrectos';
    });
  }
  
}
