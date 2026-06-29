import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextMenuButton } from './context-menu-button';

describe('ContextMenuButton', () => {
  let component: ContextMenuButton;
  let fixture: ComponentFixture<ContextMenuButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextMenuButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContextMenuButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
