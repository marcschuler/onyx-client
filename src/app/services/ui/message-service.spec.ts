import { TestBed } from '@angular/core/testing';

import { MessageService } from '../message-service';

describe('MessageService', () => {
  let service: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('convert links',()=>{
    expect(service.convertLinksToMarkdownLinks('')).toBe('');
    expect(service.convertLinksToMarkdownLinks('httptest')).toBe('httptest');
    expect(service.convertLinksToMarkdownLinks('http://example.com')).toBe('[http://example.com](http://example.com)')
    expect(service.convertLinksToMarkdownLinks('test http://example.com test')).toBe('test [http://example.com](http://example.com) test')
  })
});
