import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelTree } from './channel-tree';

describe('ChannelTree', () => {
  let component: ChannelTree;
  let fixture: ComponentFixture<ChannelTree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelTree]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelTree);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
