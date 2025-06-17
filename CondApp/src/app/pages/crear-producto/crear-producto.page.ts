import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, AlertController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ProductosService } from '../../services/productos.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  standalone: true,
  selector: 'app-crear-producto',
  templateUrl: './crear-producto.page.html',
  styleUrls: ['./crear-producto.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class CrearProductoPage implements OnInit {
  productoForm!: FormGroup;
  rol: 'usuario' | 'admin' = 'usuario';
  imagenPreview!: string | undefined;
  imagenFile!: string | undefined;

  @ViewChild('fileInput') fileInput!: any;

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private productosService: ProductosService,
    private authService: AuthService,
    private firestore: Firestore,
    private alertController: AlertController
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      descripcion: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]],
      imagen: [''],
      precio: ['', [
        Validators.required,
        Validators.pattern('^[0-9]*$')
      ]]
    });

    // Suscribirse a cambios en el formulario para mostrar errores
    this.productoForm.valueChanges.subscribe(() => {
      console.log('Estado del formulario:', this.productoForm.valid);
      console.log('Errores del formulario:', this.productoForm.errors);
    });
  }

  ngOnInit(): void {
    this.rol = this.authService.getRol() as 'usuario' | 'admin';
    // Obtener el número de WhatsApp del usuario desde Firestore
    const uid = this.authService.getUID();
    const docRef = doc(this.firestore, 'usuarios', uid);
    getDoc(docRef).then(docSnap => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData?.['celular']) {
          this.productoForm.patchValue({ whatsapp: userData['celular'] });
        }
      }
    });
  }

  private formatearPrecio(precio: string): string {
    const num = parseInt(precio);
    return num.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP'
    });
  }

  private async presentAlert(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  seleccionarImagen() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagenPreview = e.target?.result as string;
        this.productoForm.patchValue({ imagen: file.name });
      };
      reader.readAsDataURL(file);
    }
  }

  async guardar(): Promise<void> {
    if (!this.productoForm.valid) {
      this.presentAlert('Error', 'Por favor, complete todos los campos requeridos.');
      return;
    }

    // Validar que el precio sea un número válido
    const precio = this.productoForm.value.precio;
    if (precio && !/^[0-9]+$/.test(precio)) {
      this.presentAlert('Error', 'El precio debe ser un número válido.');
      return;
    }

    // Obtener los datos del usuario actual
    const uid = this.authService.getUID();
    const docRef = doc(this.firestore, 'usuarios', uid);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Usuario no encontrado en la base de datos');
    }
    
    const userData = docSnap.data();
    const nombre = userData?.['nombre'] || 'Usuario';
    const casa = userData?.['casa'] || '0';
    const avatar = userData?.['avatarUrl'] || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}`;
    const whatsapp = userData?.['whatsapp'];
    
    // Formatear la casa como "Casa X"
    const casaFormateada = `Casa ${casa}`;
    
    // Crear el producto con los datos del usuario
    const producto = {
      ...this.productoForm.value,
      fecha: new Date().toISOString(),
      usuario: nombre,
      casa: casaFormateada,
      avatarUrl: avatar,
      likes: 0,
      precio: this.formatearPrecio(this.productoForm.value.precio),
      uid: uid,
      // Usar la misma propiedad que se usa en el template
      imagenUrl: this.imagenPreview || '',
      // Incluir el número de WhatsApp solo si existe
      ...(whatsapp ? { whatsapp } : {})
    };

    // Eliminar cualquier campo undefined
    Object.keys(producto).forEach(key => {
      if (producto[key] === undefined) {
        delete producto[key];
      }
    });

    // Si hay imagen, obtener la URL base64
    if (this.imagenPreview) {
      producto.imagen = this.imagenPreview;
    }

    try {
      // Primero intentar crear el producto
      await this.productosService.crearProducto(producto);
      
      // Si el producto se crea exitosamente, limpiar el formulario
      this.productoForm.reset();
      this.imagenPreview = undefined;
      this.imagenFile = undefined;
      
      // Navegar a home después de un breve delay para asegurar que la navegación sea exitosa
      setTimeout(() => {
        this.navCtrl.navigateRoot('/home', {
          animated: true,
          animationDirection: 'forward'
        });
      }, 100);
    } catch (err: any) {
      console.error('Error al crear producto', err);
      let mensajeError = 'No se pudo crear el producto. Por favor, inténtelo nuevamente.';
      
      // Si es un error de Firebase, mostrar mensaje más específico
      if (err.code === 'permission-denied') {
        mensajeError = 'No tienes permisos para crear productos. Por favor, inicia sesión.';
      }
      
      this.presentAlert('Error', mensajeError);
    } finally {
      // Si hay algún error, limpiar el formulario de todos modos
      this.productoForm.reset();
      this.imagenPreview = undefined;
      this.imagenFile = undefined;
    }
  }

  cancelar(): void {
    // Limpiar el formulario antes de navegar
    this.productoForm.reset();
    this.imagenPreview = undefined;
    this.imagenFile = undefined;
    
    // Navegar a home
    this.navCtrl.navigateBack('/home', {
      animated: true,
      animationDirection: 'back'
    });
  }
}
