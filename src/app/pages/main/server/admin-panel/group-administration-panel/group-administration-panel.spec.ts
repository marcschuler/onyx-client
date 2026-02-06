import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAdministrationPanel } from './group-administration-panel';

describe('GroupAdministrationPanel', () => {
  let component: GroupAdministrationPanel;
  let fixture: ComponentFixture<GroupAdministrationPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupAdministrationPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupAdministrationPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
