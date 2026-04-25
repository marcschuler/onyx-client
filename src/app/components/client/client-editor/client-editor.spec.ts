import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientEditor } from './client-editor';

describe('ClientEditor', () => {
  let component: ClientEditor;
  let fixture: ComponentFixture<ClientEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
