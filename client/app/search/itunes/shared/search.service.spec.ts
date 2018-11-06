import { TestBed, inject } from '@angular/core/testing';
import {Http} from '@angular/http';

import { ItunesSearchService } from './search.service';

describe('SearchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ItunesSearchService]
    });
  });

  it('should be created', inject([ItunesSearchService], (service: ItunesSearchService) => {
    expect(service).toBeTruthy();
  }));
});
