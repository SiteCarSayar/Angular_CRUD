import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Student } from '../entity/student';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../service/common.service';

@Component({
  selector: 'app-delete-student',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './delete-student.component.html',
  styleUrl: './delete-student.component.css'
})
export class DeleteStudentComponent {

 student:Student=new Student();
 studentId:number | null = null;
 

  constructor(private httpClient:HttpClient,private commonService:CommonService){}

deleteStudent() {
    if (this.studentId == null) {
      window.alert('Please enter a Student ID.');
     
      return;
    }
     window.alert('Student ID is '+this.studentId);
 
    this.commonService.deleteStudent(this.student).subscribe(
       (response: any) => {
        if (response) {
          window.alert("Deleted Successfully!");
        } else {
          window.alert("Delete failed.");
        }
      });
}

  reset() {
    this.studentId = null;
  }
}
