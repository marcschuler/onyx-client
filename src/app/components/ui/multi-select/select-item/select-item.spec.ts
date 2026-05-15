import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectItem } from './select-item';

describe('SelectItem', () => {
  let component: SelectItem;
  let fixture: ComponentFixture<SelectItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
