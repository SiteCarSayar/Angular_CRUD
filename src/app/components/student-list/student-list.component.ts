import { Component, OnInit } from '@angular/core';
import { Student } from '../entity/student';
import { CommonService } from '../service/common.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']   // ✅ fixed "styleUrl" → should be "styleUrls"
})
export class StudentListComponent implements OnInit {

  student: Student = new Student();
  studentList: Student[] = [];

  constructor(
    private commonService: CommonService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllStudent();  
  }

  getAllStudent(): void {
    this.commonService.getAllStudent().subscribe({
      next: (students: Student[]) => {
        if (students && students.length > 0) {
          this.studentList = students;
        } else {
          alert("No students found");
        }
      },  
    });
  }

  deleteStudent(student:Student) {
    if (window.confirm("Are you sure to delete this student")) {
         this.commonService.deleteStudent(student).subscribe((response:any)=>{
        if(response){
          window.alert("Deleted Successfully!");
          this.getAllStudent();
        }else {
          window.alert("Delete failed.");
        }
      });
    }
 }

 editStudent(studentID:number){ 
  alert("Edit student with ID: " + studentID);
    this.router.navigate(['/student/edit', studentID]);
}

goToAddStudent(){
  this.router.navigate(['/student/save']);
}
goToSearch(){
  this.router.navigate(['/student/search']);
}

}
