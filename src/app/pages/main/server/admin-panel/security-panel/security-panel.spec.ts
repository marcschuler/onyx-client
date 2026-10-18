import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityPanel } from './security-panel';

describe('SecurityPanel', () => {
  let component: SecurityPanel;
  let fixture: ComponentFixture<SecurityPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
