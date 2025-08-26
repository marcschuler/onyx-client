import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentityWizzard } from './identity-wizzard';

describe('IdentityWizzard', () => {
  let component: IdentityWizzard;
  let fixture: ComponentFixture<IdentityWizzard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdentityWizzard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdentityWizzard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
