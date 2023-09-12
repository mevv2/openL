import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewWindowComponent } from './review-window.component';

describe('ReviewWindowComponent', () => {
  let component: ReviewWindowComponent;
  let fixture: ComponentFixture<ReviewWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
