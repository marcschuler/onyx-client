import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeerView } from './peer-view';

describe('PeerView', () => {
  let component: PeerView;
  let fixture: ComponentFixture<PeerView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeerView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeerView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
