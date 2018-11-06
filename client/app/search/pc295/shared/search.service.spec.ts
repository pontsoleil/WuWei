import { TestBed, inject } from '@angular/core/testing';
import {Http} from '@angular/http';

import { PC295SearchService } from './search.service';

describe('SearchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PC295SearchService]
    });
  });

  it('should be created', inject([PC295SearchService], (service: PC295SearchService) => {
    expect(service).toBeTruthy();
  }));
});
