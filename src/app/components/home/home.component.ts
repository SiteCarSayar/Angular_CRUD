
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
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatButtonModule, MatSelectModule, MatRadioModule,
    MatNativeDateModule, MatDatepickerModule, MatInputModule, MatFormFieldModule,
    CommonModule, FormsModule, ReactiveFormsModule, ToastModule,DialogModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  studentRegi:boolean=true;
  displaySuccessDialog = false;
  selectedFile!: File;
  student: Student = new Student();

  constructor(private commonService: CommonService,private router:Router,private messageService:MessageService) { }

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

  // save() {
  //   if (!this.student.studentName || !this.student.fatherName || !this.student.email) {
  //     console.log("Please fill in all required fields.");
  //     return;
  //   }
  //   this.commonService.save(this.student).subscribe((response: any) => {
  //     if (response) {
  //      this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Student Saved successfully!', life: 3000 });
  //       this.student = new Student();
  //       this.router.navigate(['/student/list']);
  //     } else {
  //       this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Can not Saved!', life: 3000 });
       
  //     }
  //   });
  // }
  saveWithFile() {
    if (!this.student.studentName || !this.student.fatherName || !this.student.email) {
      console.log(this.student.studentName);
      console.log("Please fill in all required fields.");
      return;
    }
    this.commonService.saveWithFile(this.student,this.selectedFile).subscribe((response: any) => {
      if (response) {
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Student Saved successfully!', life: 3000 });
        this.student = new Student();
        this.router.navigate(['/student/list']);
      } else {
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Can not Saved!', life: 3000 });
       
      }
    });
  }

  // editStudent(){ 
  //   if(!this.student.studentID){
  //     console.log("Student ID is missing for update.");
  //     this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Student ID is missing for update.', life: 3000 });
  //     return;
  //   }
  //   this.commonService.updateStudent(this.student,this.selectedFile).subscribe((response:any)=>{
  //     if(response){
  //       this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Student Saved successfully!', life: 3000 });
  //       console.log("Updated Successfully!");
  //       this.student=new Student();
  //       this.router.navigate(['/student/list']);
  //     }else {
  //       this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Can not update!', life: 3000 });
  //       console.log("Update failed.");
  //     }
  //   }); 
  // }
  editStudent(){
   this.commonService.updateStudent(this.student, this.selectedFile).subscribe((response: any) => {
    if (response) {
      // show success dialog
      this.displaySuccessDialog = true;

      // automatically hide after 3 seconds
      setTimeout(() => {
        this.displaySuccessDialog = false;
        this.student = new Student();
        this.router.navigate(['/student/list']);
      }, 3000);
    } else {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Failed', 
        detail: 'Update failed.', 
        life: 3000 
      });
      console.log("Update failed.");
    }
  });
  }
  back(){
    this.router.navigate(['/student/list']);
  }



}



