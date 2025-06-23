import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonItem, 
  IonInput,
  IonIcon,
  IonSpinner,
  NavController,
  ToastController,
  AnimationController,
  GestureController,
  Platform
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard as KeyboardPlugin } from '@capacitor/keyboard';
import { Gesture, GestureDetail } from '@ionic/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButton, 
    IonItem, 
    IonInput,
    IonIcon,
    IonSpinner
  ],
})
export class LoginPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;
  @ViewChild('loginCard') loginCard!: ElementRef;
  
  loginForm: FormGroup;
  error: string | null = null;
  isLoading = false;
  keyboardHeight = 0;
  isKeyboardVisible = false;
  cardScale = 1;
  cardTranslateY = 0;
  private gesture?: Gesture;

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private animationCtrl: AnimationController,
    private gestureCtrl: GestureController,
    private platform: Platform,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    
    // Configurar el formulario para marcar como touched al interactuar
    this.setupFormTouches();
  }

  async ngOnInit() {
    // Configurar listeners del teclado
    this.setupKeyboardListeners();
    
    // Configurar gestos
    this.setupGestures();
    
    // Configurar la barra de estado
    this.setupStatusBar();
  }
  
  private setupFormTouches() {
    // Marcar los campos como touched al interactuar
    const markAsTouched = (field: string) => {
      const control = this.loginForm.get(field);
      control?.valueChanges.subscribe(() => {
        if (!control.touched) {
          control.markAsTouched({ onlySelf: true });
        }
      });
    };
    
    markAsTouched('email');
    markAsTouched('password');
  }
  
  private async setupStatusBar() {
    if (this.platform.is('capacitor')) {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: 'var(--ion-color-primary)' });
      } catch (e) {
        console.warn('No se pudo configurar la barra de estado', e);
      }
    }
  }
  
  private setupKeyboardListeners() {
    // Escuchar cambios en la altura del teclado
    if (this.platform.is('cordova') || this.platform.is('capacitor')) {
      KeyboardPlugin.addListener('keyboardWillShow', (info: any) => {
        this.keyboardHeight = info.keyboardHeight;
        this.isKeyboardVisible = true;
        this.adjustLayoutForKeyboard();
      });
      
      KeyboardPlugin.addListener('keyboardWillHide', () => {
        this.keyboardHeight = 0;
        this.isKeyboardVisible = false;
        this.resetLayout();
      });
    } else {
      // Para navegador
      window.addEventListener('resize', () => {
        const isKeyboardOpen = window.innerHeight < (this.platform.height() as number) * 0.8;
        if (isKeyboardOpen !== this.isKeyboardVisible) {
          this.isKeyboardVisible = isKeyboardOpen;
          if (isKeyboardOpen) {
            this.adjustLayoutForKeyboard();
          } else {
            this.resetLayout();
          }
        }
      });
    }
  }
  
  private async setupGestures() {
    if (!this.platform.is('mobile')) return;
    
    // Esperar a que la vista esté lista
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!this.loginCard?.nativeElement) return;
    
    const gesture = await this.gestureCtrl.create({
      el: this.loginCard.nativeElement,
      gestureName: 'card-press',
      onStart: () => this.onPressStart(),
      onEnd: () => this.onPressEnd(),
    });
    
    gesture.enable();
    this.gesture = gesture as any;
  }
  
  private onPressStart() {
    if (!this.loginCard?.nativeElement) return;
    
    this.animationCtrl.create()
      .addElement(this.loginCard.nativeElement)
      .duration(100)
      .easing('cubic-bezier(0.4, 0, 0.2, 1)')
      .fromTo('transform', 'scale(1)', 'scale(0.98)')
      .play();
    
    // Retroalimentación háptica
    if (this.platform.is('mobile')) {
      Haptics.impact({ style: ImpactStyle.Light });
    }
  }
  
  private onPressEnd() {
    if (!this.loginCard?.nativeElement) return;
    
    this.animationCtrl.create()
      .addElement(this.loginCard.nativeElement)
      .duration(150)
      .easing('cubic-bezier(0.4, 0, 0.2, 1)')
      .fromTo('transform', 'scale(0.98)', 'scale(1)')
      .play();
  }
  
  private adjustLayoutForKeyboard() {
    if (!this.platform.is('mobile') || !this.loginCard?.nativeElement) return;
    
    const animation = this.animationCtrl.create()
      .addElement(this.loginCard.nativeElement)
      .duration(300)
      .easing('cubic-bezier(0.4, 0, 0.2, 1)')
      .fromTo('margin-top', '0', '-60px')
      .fromTo('transform', 'scale(1)', 'scale(0.9)');
    
    animation.play();
    
    // Desplazar el contenido hacia arriba
    this.content.scrollToPoint(0, 0, 300);
  }
  
  private resetLayout() {
    if (!this.platform.is('mobile') || !this.loginCard?.nativeElement) return;
    
    const animation = this.animationCtrl.create()
      .addElement(this.loginCard.nativeElement)
      .duration(300)
      .easing('cubic-bezier(0.4, 0, 0.2, 1)')
      .fromTo('margin-top', '-60px', '0')
      .fromTo('transform', 'scale(0.9)', 'scale(1)');
    
    animation.play();
  }
  
  ionViewWillLeave() {
    // Limpiar listeners
    if (this.platform.is('capacitor') || this.platform.is('cordova')) {
      KeyboardPlugin.removeAllListeners();
    }
    
    if (this.gesture) {
      (this.gesture as any).destroy();
    }
  }

  async onForgotPassword(event: Event) {
    event.preventDefault();
    
    const toast = await this.toastCtrl.create({
      message: 'Por favor, contacta al administrador para restablecer tu contraseña.',
      duration: 4000,
      color: 'medium',
      position: 'bottom'
    });
    
    await toast.present();
  }

  async onLogin() {
    if (this.isLoading) return;
    
    // Ocultar teclado
    if (this.platform.is('mobile')) {
      // Usar el plugin de teclado de Capacitor
      KeyboardPlugin.hide();
    }
    
    this.error = null;
    this.isLoading = true;
    
    // Retroalimentación háptica
    if (this.platform.is('mobile')) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }

    if (this.loginForm.invalid) {
      this.error = 'Por favor completa todos los campos correctamente.';
      this.isLoading = false;
      return;
    }

    const { email, password } = this.loginForm.value;

    try {
      const { rol } = await this.authService.login(email, password);
      console.log('Login exitoso con rol:', rol);
      this.navCtrl.navigateRoot('/home');
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      this.error = 'Correo o contraseña incorrectos o usuario sin datos.';
      this.isLoading = false;
    }
  }


}
