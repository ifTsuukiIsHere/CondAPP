import { Component, OnInit, OnDestroy, ViewChild, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonBackButton, 
  IonFooter, 
  IonButton, 
  IonSpinner,
  IonIcon,
  IonItem,
  IonGrid,
  IonRow,
  IonCol,
  IonTextarea,
  NavController,
  IonText,
  ToastController,
  LoadingController,
  AlertController,
  IonFab,
  IonFabButton
} from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';
import { ChatService, Mensaje } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Subscription, firstValueFrom } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { Timestamp } from '@angular/fire/firestore';

// Usamos la interfaz Mensaje del servicio de chat

@Component({
  selector: 'app-chat-libre',
  templateUrl: './chat-libre.page.html',
  styleUrls: ['./chat-libre.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonFooter,
    IonButton,
    IonSpinner,
    IonIcon,
    IonItem,
    IonGrid,
    IonRow,
    IonCol,
    IonTextarea,
    IonFab,
    IonFabButton
  ],
  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ChatLibrePage implements OnInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  @ViewChild('messagesContainer') private messagesContainer: any;
  
  // Control de visibilidad del botón de desplazamiento
  showScrollButton = false;
  private scrollThreshold = 300; // Distancia desde abajo para mostrar el botón
  
  mensajes: Mensaje[] = [];
  mensajeNuevo = '';
  usuarioActual: { id: string; nombre: string; avatar: string } | null = null;
  isLoading = true;
  isSending = false;
  private mensajesSubscription: Subscription | null = null;

  constructor(
    private navCtrl: NavController,
    private datePipe: DatePipe,
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarUsuarioActual();
    this.suscribirAMensajes();
  }

  ngOnDestroy() {
    if (this.mensajesSubscription) {
      this.mensajesSubscription.unsubscribe();
    }
  }

  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);

  private async cargarUsuarioActual() {
    try {
      const user = await this.authService.getCurrentUser();
      if (user) {
        this.usuarioActual = {
          id: user.uid,
          nombre: user.displayName || 'Usuario Anónimo',
          avatar: 'assets/avatar-default.png' // Usamos un avatar por defecto
        };
      } else {
        this.mostrarError('No se pudo cargar la información del usuario');
        this.navCtrl.navigateRoot('/login');
      }
    } catch (error) {
      console.error('Error al cargar el usuario:', error);
      this.mostrarError('Error al cargar la información del usuario');
      this.navCtrl.navigateRoot('/login');
    }
  }

  private suscribirAMensajes() {
    // Cancelar la suscripción anterior si existe
    if (this.mensajesSubscription) {
      this.mensajesSubscription.unsubscribe();
    }

    this.isLoading = true;
    this.mensajesSubscription = this.chatService.obtenerMensajes().subscribe({
      next: (mensajes) => {
        this.mensajes = mensajes;
        this.isLoading = false;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('Error al cargar mensajes:', error);
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.navCtrl.back();
  }

  async enviarMensaje() {
    const texto = this.mensajeNuevo.trim();
    if (!texto || !this.usuarioActual) return;

    try {
      this.isSending = true;
      
      // Obtener el perfil del usuario actual para incluir el número de casa
      const userProfile = await this.authService.getCurrentUser();
      const numeroCasa = userProfile?.casa || '00'; // Usar '00' como valor por defecto si no hay número de casa
      
      // Usar el método del servicio para enviar el mensaje
      await this.chatService.enviarMensaje({
        autor: this.usuarioActual.nombre,
        autorId: this.usuarioActual.id,
        texto: texto,
        avatar: this.usuarioActual.avatar,
        numeroCasa: numeroCasa // Incluir el número de casa
      });
      
      this.mensajeNuevo = '';
      this.scrollToBottom();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      this.mostrarError('No se pudo enviar el mensaje. Intenta de nuevo.');
    } finally {
      this.isSending = false;
      this.scrollToBottom();
    }
  }

  // Método para formatear la hora
  formatearHora(fecha?: Date | any): string {
    if (!fecha) return '';
    
    // Si es un Timestamp de Firestore, convertirlo a Date
    const fechaObj = fecha instanceof Date ? fecha : (fecha.toDate ? fecha.toDate() : new Date(fecha));
    
    // Si es hoy, mostrar solo la hora, si no, mostrar fecha y hora
    const hoy = new Date();
    const esHoy = fechaObj.getDate() === hoy.getDate() &&
                  fechaObj.getMonth() === hoy.getMonth() &&
                  fechaObj.getFullYear() === hoy.getFullYear();

    return this.datePipe.transform(fechaObj, esHoy ? 'shortTime' : 'short') || '';
  }

  // Verifica si el mensaje es del usuario actual
  esMio(mensaje: Mensaje): boolean {
    return !!(this.usuarioActual && mensaje.autorId === this.usuarioActual.id);
  }

  // Maneja el evento de desplazamiento
  onScroll(event: any) {
    const scrollElement = event.target;
    const scrollPosition = scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight;
    this.showScrollButton = scrollPosition > this.scrollThreshold;
  }

  // Desplaza el chat al final
  scrollToBottom() {
    if (this.content) {
      this.content.scrollToBottom(300);
    }
  }

  // Muestra un mensaje de error al usuario
  private async mostrarError(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      buttons: [{
        icon: 'close',
        role: 'cancel'
      }]
    });
    await toast.present();
  }

  // Muestra un indicador de carga
  private async mostrarCargando(mensaje: string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
  }
}