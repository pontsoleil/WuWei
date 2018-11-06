import { TestBed, inject } from '@angular/core/testing';
import {Http} from '@angular/http';

import { GoogleBooksSearchService } from './search.service';

describe('SearchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GoogleBooksSearchService]
    });
  });

  it('should be created', inject([GoogleBooksSearchService], (service: GoogleBooksSearchService) => {
    expect(service).toBeTruthy();
  }));
});
