import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientAbout } from './client-about';

describe('ClientAbout', () => {
  let component: ClientAbout;
  let fixture: ComponentFixture<ClientAbout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientAbout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientAbout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
