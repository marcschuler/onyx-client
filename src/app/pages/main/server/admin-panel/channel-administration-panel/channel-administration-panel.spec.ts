import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelAdministrationPanel } from './channel-administration-panel';

describe('ChannelAdministrationPanel', () => {
  let component: ChannelAdministrationPanel;
  let fixture: ComponentFixture<ChannelAdministrationPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelAdministrationPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelAdministrationPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
