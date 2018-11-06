import { TestBed, inject } from '@angular/core/testing';
import {Http} from '@angular/http';

import { YoutubeSearchService } from './search.service';

describe('SearchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [YoutubeSearchService]
    });
  });

  it('should be created', inject([YoutubeSearchService], (service: YoutubeSearchService) => {
    expect(service).toBeTruthy();
  }));
});
