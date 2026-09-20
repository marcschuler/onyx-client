import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerEntry } from './server-entry';

describe('ServerEntry', () => {
  let component: ServerEntry;
  let fixture: ComponentFixture<ServerEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerEntry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerEntry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
