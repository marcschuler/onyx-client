import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerUser } from './server-user';

describe('ServerUser', () => {
  let component: ServerUser;
  let fixture: ComponentFixture<ServerUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
