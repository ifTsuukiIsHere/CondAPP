import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { ReclamosService } from 'src/app/services/reclamos.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-gestionar-mis-reclamos',
  templateUrl: './gestionar-mis-reclamos.page.html',
  styleUrls: ['./gestionar-mis-reclamos.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class GestionarMisReclamosPage implements OnInit {
  reclamos: any[] = [];

  constructor(
    private reclamosService: ReclamosService,
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarReclamosUsuario();
  }

  async cargarReclamosUsuario() {
    try {
      const userId = this.authService.getUID();
      const reclamos$ = this.reclamosService.getReclamos();
      reclamos$.subscribe(reclamos => {
        this.reclamos = reclamos.filter(r => r.userId === userId);
      });
    } catch (error) {
      console.error('Error al cargar reclamos:', error);
    }
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
              const userId = this.authService.getUID();
              const userRol = this.authService.getRol();
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

  volver() {
    this.router.navigate(['/home']);
  }
}
