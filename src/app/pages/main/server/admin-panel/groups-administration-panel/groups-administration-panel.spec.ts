import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsAdministrationPanel } from './groups-administration-panel';

describe('GroupsAdministrationPanel', () => {
  let component: GroupsAdministrationPanel;
  let fixture: ComponentFixture<GroupsAdministrationPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupsAdministrationPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupsAdministrationPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
