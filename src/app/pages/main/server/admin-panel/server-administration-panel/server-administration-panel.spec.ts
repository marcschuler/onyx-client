import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerAdministrationPanel } from './server-administration-panel';

describe('ServerAdministrationPanel', () => {
  let component: ServerAdministrationPanel;
  let fixture: ComponentFixture<ServerAdministrationPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerAdministrationPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerAdministrationPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
