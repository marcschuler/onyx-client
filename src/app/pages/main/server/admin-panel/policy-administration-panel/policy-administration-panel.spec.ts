import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyAdministrationPanel } from './policy-administration-panel';

describe('PolicyAdministrationPanel', () => {
  let component: PolicyAdministrationPanel;
  let fixture: ComponentFixture<PolicyAdministrationPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyAdministrationPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyAdministrationPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
