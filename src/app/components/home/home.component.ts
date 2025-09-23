
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Student } from '../entity/student';
import { CommonService } from '../service/common.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatButtonModule, MatSelectModule, MatRadioModule,
    MatNativeDateModule, MatDatepickerModule, MatInputModule, MatFormFieldModule,
    CommonModule, FormsModule, ReactiveFormsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  studentRegi:boolean=true;
  selectedFile!: File;
  student: Student = new Student();

  constructor(private commonService: CommonService,private router:Router) { }

  ngOnInit(): void {

    const id =Number(this.router.url.split('/').pop());

    if (id) {
      this.studentRegi=false;
      this.commonService.getById(id).subscribe((response:any)=>{
        if(response){
          console.log("Student found with ID: "+id);
          this.student=response;
          this.studentRegi=false;
          this.findById(id);
        }
      });
    }
  }
onFileSelected(event: any) {
  if (event.target.files && event.target.files.length > 0) {
    this.selectedFile = event.target.files[0];
    console.log("File selected:", this.selectedFile.name);
  }

}
  
 
  findById(id:number){
    this.commonService.getById(id).subscribe((response:any)=>{
      if(response){ 
        this.student=response;
      }else{
        console.log("Student not found with ID: "+id);
      }
    });
  }

  save() {
    if (!this.student.studentName || !this.student.fatherName || !this.student.email) {
      console.log("Please fill in all required fields.");
      return;
    }
    this.commonService.save(this.student).subscribe((response: any) => {
      if (response) {
        console.log("Saved Successfully!");
        this.student = new Student();
        this.router.navigate(['/student/list']);
      } else {
        console.log("Save failed.");
      }
    });
  }
  saveWithFile() {
    if (!this.student.studentName || !this.student.fatherName || !this.student.email) {
      console.log("Please fill in all required fields.");
      return;
    }
    this.commonService.saveWithFile(this.student,this.selectedFile).subscribe((response: any) => {
      if (response) {
        console.log("Saved Successfully with file!");
        this.student = new Student();
        this.router.navigate(['/student/list']);
      } else {
        console.log("Save with file failed.");
      }
    });
  }

  editStudent(){ 
    if(!this.student.studentID){
      console.log("Student ID is missing for update.");
      return;
    }
    this.commonService.updateStudent(this.student).subscribe((response:any)=>{
      if(response){
        console.log("Updated Successfully!");
        this.student=new Student();
        this.router.navigate(['/student/list']);
      }else {
        console.log("Update failed.");
      }
    }); 
  }
  back(){
    this.router.navigate(['/student/list']);
  }



}



