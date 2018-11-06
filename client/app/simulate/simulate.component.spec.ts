import { async,
  ComponentFixture,
  TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SimulateComponent } from './simulate.component';

describe('Component: About', () => {
  let component: SimulateComponent;
  let fixture: ComponentFixture<SimulateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimulateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimulateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
