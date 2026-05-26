import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitPanelBar } from './split-panel-bar';

describe('SplitPanelBar', () => {
  let component: SplitPanelBar;
  let fixture: ComponentFixture<SplitPanelBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplitPanelBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SplitPanelBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
