import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton
  ]
})
export class ThemeToggleComponent implements OnInit {
  darkMode = false;

  constructor() {}

  ngOnInit() {
    this.checkDarkMode();
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    this.applyTheme();
  }

  private checkDarkMode() {
    // Verificar preferencia guardada
    const savedMode = localStorage.getItem('darkMode');
    
    if (savedMode !== null) {
      this.darkMode = savedMode === 'true';
    } else {
      // Usar la preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      this.darkMode = prefersDark.matches;
    }
    
    this.applyTheme();
  }

  private applyTheme() {
    if (this.darkMode) {
      document.body.classList.add('dark');
      document.body.classList.add('ion-palette-dark');
    } else {
      document.body.classList.remove('dark');
      document.body.classList.remove('ion-palette-dark');
    }
    
    // Guardar preferencia
    localStorage.setItem('darkMode', this.darkMode.toString());
  }
}
