import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelContextMenu } from './channel-context-menu';

describe('ChannelContextMenu', () => {
  let component: ChannelContextMenu;
  let fixture: ComponentFixture<ChannelContextMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelContextMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelContextMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
