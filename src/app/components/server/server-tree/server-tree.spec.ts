import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerTree } from './server-tree';

describe('ServerTree', () => {
  let component: ServerTree;
  let fixture: ComponentFixture<ServerTree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerTree]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerTree);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
