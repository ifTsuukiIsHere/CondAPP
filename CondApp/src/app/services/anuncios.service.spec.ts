import { TestBed } from '@angular/core/testing';

import { AnunciosService } from './anuncios.service';
import { doc, getDoc, updateDoc, arrayUnion } from '@angular/fire/firestore';

describe('AnunciosService', () => {
  let service: AnunciosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnunciosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
});




