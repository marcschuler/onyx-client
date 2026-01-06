import { TestBed } from '@angular/core/testing';

import { RestController } from './rest-controller';

describe('RestController', () => {
  let service: RestController;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
