import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerOverview } from './server-overview';

describe('ServerOverview', () => {
  let component: ServerOverview;
  let fixture: ComponentFixture<ServerOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
