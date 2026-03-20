import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyEditor } from './policy-editor';

describe('PolicyEditor', () => {
  let component: PolicyEditor;
  let fixture: ComponentFixture<PolicyEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
