import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonToolbar, 
  IonButtons, 
  IonBackButton, 
  IonTitle
} from '@ionic/angular/standalone';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-main-toolbar',
  templateUrl: './main-toolbar.component.html',
  styleUrls: ['./main-toolbar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonToolbar, 
    IonButtons, 
    IonBackButton, 
    IonTitle,
    ThemeToggleComponent
  ]
})
export class MainToolbarComponent {
  @Input() title: string = 'CondAPP';
  @Input() showBackButton: boolean = false;
  
  constructor() {}
}
