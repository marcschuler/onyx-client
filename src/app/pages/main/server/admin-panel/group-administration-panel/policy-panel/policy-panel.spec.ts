import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyPanel } from './policy-panel';

describe('PolicyPanel', () => {
  let component: PolicyPanel;
  let fixture: ComponentFixture<PolicyPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
