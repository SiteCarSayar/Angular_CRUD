import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';

// App-specific imports
import { Student } from '../entity/student';
import { CommonService } from '../service/common.service';


interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [FormsModule, CommonModule, DialogModule, ButtonModule, ToastModule, TableModule, AutoCompleteModule],
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css'],
  providers: [MessageService]
})
export class StudentListComponent implements OnInit {

  Math = Math;
  studentList: Student[] = [];
  student: Student = new Student();
  totalRecords: number = 0;
  selectedFile: File | null = null;

  //for checking existing email and nrc
  emailExists: boolean = false;
  nrcExists: boolean = false;

  //for student edit and create
  studentRegi: boolean = false;

  //for search box
  searchKeyword: string = '';

  start = 0;      // offset of the current page
  pageSize = 10;   // records per page
  allView = false;

  // For delete dialog
  studentToDelete: Student | null = null;
  displayDeleteDialog = false;

  //for student form
  visibleForm: boolean = false;

  // For file preview
  previewUrl: string | ArrayBuffer | null = null;
  selectedFileName: String = '';
  constructor(
    private commonService: CommonService,
    private router: Router,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.loadPage(0); // load first page
  }

  showDialog() {
    this.studentRegi = true;
    this.visibleForm = true;
  }

  // Called by "Search" button
  searchManual() {
    if (!this.searchKeyword || this.searchKeyword.trim() === '') return;

    this.commonService.searchByNameOrId(this.searchKeyword)
      .subscribe((data: Student[]) => {
        this.studentList = data; // update table with results
      });
  }
  ResetSearch() {
    this.searchKeyword = '';
    this.loadPage(0); // reload first page
  }


  saveWithFile() {
    if (!this.student.studentName || !this.student.fatherName || !this.student.email || !this.student.nrcNo || !this.student.grade) {
      this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Please fill in all important fields', life: 3000 });
      return;
    }
    if (this.student.email) {
      this.commonService.checkEmailExist(this.student.email).subscribe({
        next: (exists: boolean) => {
          if (exists) {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: 'This email is already Exits!',
              life: 3000
            });
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to save student.',
            life: 3000
          });
        }
      });
    }

    this.commonService.saveWithFile(this.student, this.selectedFile).subscribe((response: any) => {
      if (response) {
        this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Student Created successfully!', life: 3000 });
        this.student = new Student();
        this.visibleForm = false;
        this.loadPage(0); // Refresh list to show new student
      } else {
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Can not Saved!', life: 3000 });

      }
    });
  }
  editStudent(student: Student): void {
    this.studentRegi = false;
    this.visibleForm = true;
    this.student = { ...student }; // Create a copy of the student object to edit

    // file preview
    if (student.fileData) {
      this.previewUrl = `data:image/jpeg;base64,${student.fileData}`;
      this.selectedFileName = student.fileName;
      console.log("Selected file name:", this.selectedFileName);
    } else {
      this.previewUrl = null;
      this.selectedFileName = '';
    }
    this.selectedFile = null; // user can select new file if needed

  }
  updateStudent() {
    if (!this.student.studentName || !this.student.fatherName || !this.student.email || !this.student.nrcNo || !this.student.grade) {
      this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Please fill in all important fields', life: 3000 });
      return;
    }
    this.commonService.updateStudent(this.student, this.selectedFile).subscribe((response: any) => {
      if (response) {
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Student updated successfully!', life: 3000 });
        this.student = new Student();
        this.visibleForm = false;
        this.ResetStudentForm();
        this.loadPage(this.start); // Refresh current page to show updated student
      } else {
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Can not update!', life: 3000 });
      }
    });
  }

  ResetStudentForm() {
    this.student = new Student();
    this.previewUrl = null;
    this.selectedFileName = '';
  }
  CancelEdit() {
    this.visibleForm = false;
  }


  // Load a page from the backend 10 records at a time
  loadPage(offset: number): void {
    this.start = offset;
    this.commonService.getByOffsetAndLimit(this.start, this.pageSize).subscribe(res => {
      this.studentList = res.content;            // page content
      this.totalRecords = res.totalElements;     // total number of students in DB
    });
  }

  // Go to next page pagination
  next(): void {
    if (this.allView) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'You are already viewing all records!', life: 3000 });
      return;
    }
    if (this.start + this.pageSize < this.totalRecords) {
      this.loadPage(this.start + this.pageSize);
    } else {
      // End of paging
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'End of records! Switch to "View All" to see all records.', life: 3000 });
    }
  }
  // Go to previous pagination
  previous(): void {
    if (this.start > 0) {
      this.loadPage(Math.max(this.start - this.pageSize, 0));
    }
  }

  // Toggle view all
  viewAll(): void {
    if (!this.allView) {
      this.allView = true;
      this.commonService.getByOffsetAndLimit(0, this.totalRecords || 1000).subscribe(res => {
        this.studentList = res.content;
      });
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Showing all students!', life: 3000 });
    } else {
      this.allView = false;
      this.loadPage(0);
    }
  }

  openDeleteDialog(student: Student): void {
    this.studentToDelete = student;
    this.displayDeleteDialog = true;
  }

  confirmDelete(): void {
    if (!this.studentToDelete) return;

    this.commonService.deleteStudent(this.studentToDelete).subscribe(response => {
      if (response) {
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Student deleted successfully!', life: 3000 });
        // Reload current page after deletion
        this.loadPage(this.start);
      } else {
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Delete failed.', life: 3000 });
      }
      this.displayDeleteDialog = false;
      this.studentToDelete = null;
    });
  }



  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;  // ✅ real file reference
      this.selectedFileName = file.name;
      console.log("File selected:", this.selectedFileName);

      const reader = new FileReader();
      reader.onload = e => this.previewUrl = reader.result;
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = null;
      this.selectedFileName = '';
      this.selectedFile = null;
    }
  }

  onEmailBlur(): void {
    if (!this.studentRegi) return;

    if (this.student.email) {
      this.commonService.checkEmailExist(this.student.email).subscribe({
        next: (exists: boolean) => {
          this.emailExists = exists;
        },
        error: (err) => {
          console.error('Error checking email:', err);
          this.emailExists = false;
        }
      });
    }
  }
  onNrcBlur(): void {
    if(!this.studentRegi) return;
    if (this.student.nrcNo) {
      this.commonService.checkNrcExist(this.student.nrcNo).subscribe({
        next: (exists: boolean) => {
          this.nrcExists = exists;
        },
        error: (err) => {
          console.error('Error checking NRC:', err);
          this.nrcExists = false;
        }
      });
    }
  }
}