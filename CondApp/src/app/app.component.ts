import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { ThemeToggleComponent } from './componentes/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    IonApp, 
    IonRouterOutlet, 
    RouterModule,
    ThemeToggleComponent
  ],
})
export class AppComponent {
  constructor() {}
}
