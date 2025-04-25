import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'app-gestionar-reclamos',
  templateUrl: './gestionar-reclamos.page.html',
  styleUrls: ['./gestionar-reclamos.page.scss'],
  imports: [IonicModule, CommonModule]
})
export class GestionarReclamosPage {
  reclamos = [
    {
      id: 'r1',
      autor: 'Ana Torres',
      casa: 'Casa 5',
      fecha: 'Abril 12',
      mensaje: 'La luz del pasillo no funciona.',
      estado: 'pendiente'
    },
    {
      id: 'r2',
      autor: 'Luis Pino',
      casa: 'Casa 17',
      fecha: 'Abril 11',
      mensaje: 'Basura fuera de horario.',
      estado: 'pendiente'
    }
  ];

  cambiarEstado(reclamo: any, nuevoEstado: string) {
    reclamo.estado = nuevoEstado;
    console.log('Nuevo estado:', reclamo);
  }
}
