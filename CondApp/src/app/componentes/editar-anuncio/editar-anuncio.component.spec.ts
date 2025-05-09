import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditarAnuncioComponent } from './editar-anuncio.component';

describe('EditarAnuncioComponent', () => {
  let component: EditarAnuncioComponent;
  let fixture: ComponentFixture<EditarAnuncioComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [EditarAnuncioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarAnuncioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
