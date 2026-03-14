import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelEntry } from './channel-entry';

describe('ChannelEntry', () => {
  let component: ChannelEntry;
  let fixture: ComponentFixture<ChannelEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelEntry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelEntry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
