import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  standalone: true,
  selector: 'app-editar-anuncio',
  templateUrl: './editar-anuncio.component.html',
  styleUrls: ['./editar-anuncio.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class EditarAnuncioComponent {
  @Input() anuncio: any;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private firestore: Firestore
  ) {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      mensaje: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.form.patchValue({
      titulo: this.anuncio.titulo,
      mensaje: this.anuncio.mensaje
    });
  }

  async guardar() {
    const docRef = doc(this.firestore, 'anuncios', this.anuncio.id);
    await updateDoc(docRef, this.form.value);
    this.modalCtrl.dismiss(true);
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
