import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatImage } from './chat-image';

describe('ChatImage', () => {
  let component: ChatImage;
  let fixture: ComponentFixture<ChatImage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatImage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatImage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
