import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitePanel } from './invite-panel';

describe('InvitePanel', () => {
  let component: InvitePanel;
  let fixture: ComponentFixture<InvitePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitePanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitePanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
