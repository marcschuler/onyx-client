import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerSelector } from './server-selector';

describe('ServerSelector', () => {
  let component: ServerSelector;
  let fixture: ComponentFixture<ServerSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
