import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitPanelButton } from './split-panel-button';

describe('SplitPanelButton', () => {
  let component: SplitPanelButton;
  let fixture: ComponentFixture<SplitPanelButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplitPanelButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SplitPanelButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
