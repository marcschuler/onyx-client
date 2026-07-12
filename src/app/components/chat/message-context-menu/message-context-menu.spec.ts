import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageContextMenu } from './message-context-menu';

describe('MessageContextMenu', () => {
  let component: MessageContextMenu;
  let fixture: ComponentFixture<MessageContextMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageContextMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageContextMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
