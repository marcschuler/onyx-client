import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameDescriptionPopup } from './name-description-popup';

describe('NameDescriptionPopup', () => {
  let component: NameDescriptionPopup;
  let fixture: ComponentFixture<NameDescriptionPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NameDescriptionPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NameDescriptionPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
