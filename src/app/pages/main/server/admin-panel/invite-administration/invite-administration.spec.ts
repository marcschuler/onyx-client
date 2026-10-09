import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteAdministration } from './invite-administration';

describe('InviteAdministration', () => {
  let component: InviteAdministration;
  let fixture: ComponentFixture<InviteAdministration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InviteAdministration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InviteAdministration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
