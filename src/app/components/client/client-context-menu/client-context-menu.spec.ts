import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientContextMenu } from './client-context-menu';

describe('ClientContextMenu', () => {
  let component: ClientContextMenu;
  let fixture: ComponentFixture<ClientContextMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientContextMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientContextMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
