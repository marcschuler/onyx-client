import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyVisualizer } from './key-visualizer';

describe('KeyVisualizer', () => {
  let component: KeyVisualizer;
  let fixture: ComponentFixture<KeyVisualizer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeyVisualizer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeyVisualizer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
