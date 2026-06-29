import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileImage } from './profile-image';

describe('ProfileImage', () => {
  let component: ProfileImage;
  let fixture: ComponentFixture<ProfileImage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileImage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileImage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
