import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitPanelDivider } from './split-panel-divider';

describe('SplitPanelDivider', () => {
  let component: SplitPanelDivider;
  let fixture: ComponentFixture<SplitPanelDivider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplitPanelDivider]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SplitPanelDivider);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
