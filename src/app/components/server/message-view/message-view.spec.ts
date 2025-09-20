import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageView } from './message-view';

describe('MessageView', () => {
  let component: MessageView;
  let fixture: ComponentFixture<MessageView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
