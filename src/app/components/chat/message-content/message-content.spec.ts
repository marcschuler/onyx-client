import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageContent } from './message-content';

describe('MessageContent', () => {
  let component: MessageContent;
  let fixture: ComponentFixture<MessageContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
