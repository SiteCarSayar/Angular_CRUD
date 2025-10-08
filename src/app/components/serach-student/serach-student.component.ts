import { Component } from '@angular/core';
import { CommonService } from '../service/common.service';
import { Student } from '../entity/student';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-serach-student',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './serach-student.component.html',
  styleUrl: './serach-student.component.css'
})
export class SerachStudentComponent {

  studentId: number = 0;
  studentFound: boolean = false;
  showFile: boolean = false;

  toastVisible = false;
  toastMessage = '';
  toastType = ''; // or 'danger'

  student: Student = new Student();

  constructor(private commonService: CommonService) { }

  searchStudent() {
    if (!this.studentId) {
      this.showToast("Please enter a valid Student ID.", "danger");
      return;
    }
    this.commonService.getById(this.studentId).subscribe({
      next: (response: any) => {
        this.studentFound = true;
        this.student = response;
      },
      error: (err) => {
        this.showToast("Student not found with ID: " + this.studentId, "danger");
        this.studentFound = false;
        this.student = new Student();
      }
    });

  }
  cancel() {
    this.studentId = 0;
    this.studentFound = false;
    this.student = new Student();
  }
  getFileData(fileData: string) {

    this.student.fileData = fileData;
  }
  download() {
    console.log(this.student.studentID);
    this.commonService.getFileById(this.student.studentID).subscribe({
      next: (response: any) => {
        const blob = new Blob([response], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = String(this.student.fileName);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.showToast("Error downloading file.", "danger");
      }
    });
  }
  showToast(message: string, type: string) {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 2000); // hide after 1.5 sec
  }
}
