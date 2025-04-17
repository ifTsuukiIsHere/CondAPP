import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatLibrePage } from './chat-libre.page';

describe('ChatLibrePage', () => {
  let component: ChatLibrePage;
  let fixture: ComponentFixture<ChatLibrePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatLibrePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
