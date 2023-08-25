import { TestBed } from '@angular/core/testing';

import { GoogleSheetsServiceService } from './google-sheets-service.service';

describe('GoogleSheetsServiceService', () => {
  let service: GoogleSheetsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleSheetsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
