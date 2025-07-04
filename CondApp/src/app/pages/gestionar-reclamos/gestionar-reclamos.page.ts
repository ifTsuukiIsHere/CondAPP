import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, PopoverController } from '@ionic/angular';
import { ReclamosService } from 'src/app/services/reclamos.service';
import { AuthService } from 'src/app/services/auth.service';
import { Firestore, doc, deleteDoc } from '@angular/fire/firestore';

@Component({
  standalone: true,
  selector: 'app-gestionar-reclamos',
  templateUrl: './gestionar-reclamos.page.html',
  styleUrls: ['./gestionar-reclamos.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class GestionarReclamosPage implements OnInit {
  reclamos: any[] = [];
  filtroEstado = '';

  constructor(
    private reclamosService: ReclamosService, 
    public authService: AuthService,
    private alertController: AlertController,
    private popoverController: PopoverController,
    private firestore: Firestore
  ) {}

  ngOnInit() {
    this.reclamosService.getReclamos().subscribe(datos => {
      this.reclamos = datos;
    });
  }

  get reclamosFiltrados() {
    if (!this.filtroEstado) return this.reclamos;
    return this.reclamos.filter(r => r.estado === this.filtroEstado);
  }

  cambiarEstado(reclamo: any, nuevoEstado: string) {
    this.reclamosService.actualizarEstado(reclamo.id, nuevoEstado, this.authService.getUID());
  }

  async eliminarReclamo(reclamoId: string) {
    const alerta = await this.alertController.create({
      header: '¿Eliminar reclamo?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              // Obtener el rol del usuario actual
              const userRol = this.authService.getRol();
              // Obtener el ID del usuario
              const userId = this.authService.getUID();
              
              // Usar el servicio de reclamos para eliminar
              await this.reclamosService.eliminarReclamo(reclamoId, userId, userRol);
              
              // Actualizar la lista local
              this.reclamos = this.reclamos.filter(r => r.id !== reclamoId);
              console.log('✅ Reclamo eliminado');
            } catch (error) {
              console.error('❌ Error al eliminar:', error);
              const errorAlert = await this.alertController.create({
                header: 'Error',
                message: 'No se pudo eliminar el reclamo. ' + (error as Error).message,
                buttons: ['OK']
              });
              await errorAlert.present();
            }
          }
        }
      ]
    });

    await alerta.present();
  }
}
