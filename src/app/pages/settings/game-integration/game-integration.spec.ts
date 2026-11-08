import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameIntegration } from './game-integration';

describe('GameIntegration', () => {
  let component: GameIntegration;
  let fixture: ComponentFixture<GameIntegration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameIntegration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameIntegration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
