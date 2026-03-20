import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelEditor } from './channel-editor';

describe('ChannelEditor', () => {
  let component: ChannelEditor;
  let fixture: ComponentFixture<ChannelEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
