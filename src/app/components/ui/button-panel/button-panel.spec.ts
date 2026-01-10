import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonPanel } from './button-panel';

describe('ButtonPanel', () => {
  let component: ButtonPanel;
  let fixture: ComponentFixture<ButtonPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
