import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

// App-specific imports
import { Student } from '../entity/student';
import { CommonService } from '../service/common.service';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [FormsModule, CommonModule, DialogModule, ButtonModule, ToastModule, TableModule,],
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css'],
  providers: [MessageService]
})
export class StudentListComponent implements OnInit {

  studentList: Student[] = [];
  allStudents: Student[] = [];
  totalRecords: number = 0;

  start = 0;   // first index of current page
  end = 4;     // last index of current page
  pageSize = 5;
  allView = false;

  studentToDelete: Student | null = null;
  displayDeleteDialog = false;

  constructor(private commonService: CommonService, private router: Router, private messageService: MessageService) { }

  ngOnInit(): void {
    this.commonService.getAllStudent().subscribe(students => {
       this.allStudents = students.sort((a, b) => a.studentID - b.studentID);
      this.totalRecords = students.length;
      this.loadStudentsInRange();
    });
  }

  loadStudentsInRange(): void {
    this.studentList = this.allStudents.slice(this.start, this.end + 1);
  }

  // next(): void {
  //   if (this.end < this.allStudents.length - 1) {
  //     this.start += this.pageSize;
  //     this.end += this.pageSize;
  //     if (this.end >= this.allStudents.length) this.end = this.allStudents.length - 1;
  //     this.loadStudentsInRange();
  //   } else {
  //     this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No more records!', life: 3000 });
  //   }
  // }
  next(): void {
  if (this.start + this.pageSize < this.allStudents.length) {
    this.start += this.pageSize;
    this.end = Math.min(this.start + this.pageSize - 1, this.allStudents.length - 1);
    this.loadStudentsInRange();
  } else {
    this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No more records!', life: 3000 });
  }
}

  // previous(): void {
  //   if (this.start > 0) {
  //     this.start -= this.pageSize;
  //     this.end -= this.pageSize;
  //     if (this.start < 0) this.start = 0;
  //     this.loadStudentsInRange();
  //   }
  // }

  previous(): void {
  if (this.start > 0) {
    this.start = Math.max(this.start - this.pageSize, 0);
    this.end = this.start + this.pageSize - 1;
    if (this.end >= this.allStudents.length) this.end = this.allStudents.length - 1;
    this.loadStudentsInRange();
  }
}
 viewAll(): void {
  this.commonService.getByOffsetAndLimit(0, this.totalRecords || 1000)
    .subscribe(res => {
      this.studentList = res.content;
      this.totalRecords = res.totalElements;
    });
}

  openDeleteDialog(student: Student): void {
    this.studentToDelete = student;
    this.displayDeleteDialog = true;
  }

  confirmDelete(): void {
    if (!this.studentToDelete) return;

    this.commonService.deleteStudent(this.studentToDelete).subscribe(response => {
      if (response) {
        this.allStudents = this.allStudents.filter(s => s.studentID !== this.studentToDelete?.studentID);
        this.totalRecords = this.allStudents.length;
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Student deleted successfully!', life: 3000 });
        this.loadStudentsInRange();
        
      } else {
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Delete failed.', life: 3000 });
      }
      this.displayDeleteDialog = false;
      this.studentToDelete = null;
    });
  }

  editStudent(studentID: number): void {
    this.router.navigate(['/student/edit', studentID]);
  }

  goToAddStudent(): void {
    this.router.navigate(['/student/save']);
  }

  goToSearch(): void {
    this.router.navigate(['/student/search']);
  }
}
