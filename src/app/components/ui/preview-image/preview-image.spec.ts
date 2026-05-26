import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewImage } from './preview-image';

describe('PreviewImage', () => {
  let component: PreviewImage;
  let fixture: ComponentFixture<PreviewImage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewImage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewImage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
