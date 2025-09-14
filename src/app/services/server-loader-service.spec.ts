import { TestBed } from '@angular/core/testing';

import { ServerLoaderService } from './server-loader-service';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('ServerLoaderService', () => {
  let service: ServerLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule]});
    service = TestBed.inject(ServerLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
