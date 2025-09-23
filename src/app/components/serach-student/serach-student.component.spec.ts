import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SerachStudentComponent } from './serach-student.component';

describe('SerachStudentComponent', () => {
  let component: SerachStudentComponent;
  let fixture: ComponentFixture<SerachStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SerachStudentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SerachStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
