import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  imports: [IonicModule, CommonModule],
})
export class PerfilPage {
  usuario = {
    nombre: 'Nombre de ejemplo',
    correo: 'usuario@condapp.cl',
    rol: localStorage.getItem('rol') || 'usuario'
  };
}
