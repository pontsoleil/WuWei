import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesS3Component } from './files-s3.component';

describe('FilesS3Component', () => {
  let component: FilesS3Component;
  let fixture: ComponentFixture<FilesS3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilesS3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesS3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
