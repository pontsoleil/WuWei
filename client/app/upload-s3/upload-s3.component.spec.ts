import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadS3Component } from './upload-s3.component';

describe('UploadS3Component', () => {
  let component: UploadS3Component;
  let fixture: ComponentFixture<UploadS3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadS3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadS3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
