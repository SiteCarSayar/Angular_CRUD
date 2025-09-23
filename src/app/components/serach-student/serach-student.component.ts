import { Component } from '@angular/core';
import { CommonService } from '../service/common.service';
import { Student } from '../entity/student';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-serach-student',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './serach-student.component.html',
  styleUrl: './serach-student.component.css'
})
export class SerachStudentComponent {

  studentId: number = 0;
  studentFound: boolean = false;
  showFile: boolean = false;
  student: Student = new Student();
  constructor(private commonService:CommonService) { }

  searchStudent(){
    if(!this.studentId){
      window.alert("Please enter a valid Student ID.");
      return;
    }
    this.commonService.getById(this.studentId).subscribe((response:any)=>{
      if(response){
        this.studentFound=true;
        this.student=response;
      }else{
        window.alert("Student not found with ID: "+this.studentId);
        this.studentFound=false;
      }
    });

  }
  cancel(){
    this.studentId=0;
    this.studentFound=false;
    this.student=new Student();
  }
  getFileData(fileData: string) {
    // Assuming fileData is a URL or base64 string
    this.student.fileData = fileData;
  }
}
