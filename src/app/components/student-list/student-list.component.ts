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

import * as XLSX from 'xlsx';

// App-specific imports
import { Student } from '../entity/student';
import { CommonService } from '../service/common.service';
import { blob } from 'node:stream/consumers';


@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [FormsModule, CommonModule, DialogModule, ButtonModule, ToastModule, TableModule],
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

  offset = 0;      // offset(START) of the current page
  limit = 10;      // records per page
  allView = false;

  // For delete dialog
  studentToDelete: Student | null = null;
  displayDeleteDialog = false;

  displayDownloadDialog = false;

  //for student register form or dialog
  visibleForm: boolean = false;
  isViewOnly: boolean = false;

  // For file preview
  previewUrl: string | ArrayBuffer | null = 'assets/imges/default.jpg';
  selectedFileName: String = '';

  constructor(
    private commonService: CommonService,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.loadPage(0); // load first page
  }
  //----------- for subject dropdown----------------------------
  subjects: any[] = [
    { subjectCode: 100, subjectName: 'Myanmar' },
    { subjectCode: 101, subjectName: 'English' },
    { subjectCode: 102, subjectName: 'Mathematics' },
    { subjectCode: 103, subjectName: 'Chemistry' },
    { subjectCode: 104, subjectName: 'Physics' },
    { subjectCode: 105, subjectName: 'Biology' },
    { subjectCode: 106, subjectName: 'Ecology' }
  ];
  studentMarks: { subject?: string, mark: number }[] = []; // dynamic marks array

  // Add empty subject
  addSubject() {
    if (this.studentMarks.length < this.subjects.length) {
      this.studentMarks.push({ subject: '', mark: 0 });
    }
  }
  // Remove subject row
  removeSubject(index: number) {
    this.studentMarks.splice(index, 1);
  }
  // Filter available subjects for each row
  getAvailableSubjects(index: number) {
    const selectedSubjects = this.studentMarks
      .filter((_, i) => i !== index)
      .map(sm => sm.subject);
    return this.subjects.filter(s => !selectedSubjects.includes(s.subjectName));
  }

  showDialog() {
    this.studentRegi = true;
    this.visibleForm = true;
  }

  // Called by "Search" 
  onSearchInput() {
    if (!this.searchKeyword || this.searchKeyword.trim() === '') {
      this.loadPage(0);
      return;
    }
    const keyword = this.searchKeyword.trim().toLowerCase();
    if (keyword === 'male' || keyword === 'female') {
      this.commonService.searchByGender(keyword)
        .subscribe((data: Student[]) => {
          this.studentList = data; // update table with results
        });
    } else {
      this.commonService.searchByNameOrId(this.searchKeyword)
        .subscribe((data: Student[]) => {
          this.studentList = data; // update table with results
        });
    }
  }
  //search by button
  searchManual() {
    if (!this.searchKeyword || this.searchKeyword.trim() === '' || this.searchKeyword.trim().toLowerCase() === 'male' || this.searchKeyword.trim().toLowerCase() === 'female') return;

    this.visibleForm = true; // show same dialog

    this.commonService.searchByNameOrId(this.searchKeyword.trim())
      .subscribe((data: Student[]) => {
        if (data.length === 0) {
          this.messageService.add({ severity: 'warn', summary: 'Not Found', detail: 'No student found', life: 3000 });
          return;
        }

        const student = data[0]; // take the first matching student
        this.studentRegi = false;
        this.isViewOnly = true; // view-only mode
        this.student = { ...student };

        // for passport photo
        if (student.fileData) {
          this.previewUrl = `data:image/jpeg;base64,${student.fileData}`;
          this.selectedFileName = student.fileName;
        } else {
          this.previewUrl = 'assets/imges/default.jpg';
          this.selectedFileName = '';
        }
      });
  }
  ResetSearch() {
    this.searchKeyword = '';
    this.loadPage(0); // reload first page
  }

  //for create new student or register
  //  saveWithFile() {
  //   // 1️⃣ Validate required fields
  //   if (!this.student.studentName || !this.student.dateOfBirth || !this.student.email || !this.student.nrcNo || !this.student.grade) {
  //     this.messageService.add({
  //       severity: 'error',
  //       summary: 'Failed',
  //       detail: 'Please fill in all important fields',
  //       life: 3000
  //     });
  //     return;
  //   }

  //   // 2️⃣ Check email existence first
  //   this.commonService.checkEmailExist(this.student.email).subscribe({
  //     next: (exists: boolean) => {
  //       if (exists) {
  //         this.messageService.add({
  //           severity: 'error',
  //           summary: 'Failed',
  //           detail: 'This email already exists!',
  //           life: 3000
  //         });
  //         return; // stop here if email exists
  //       }

  //       // 3️⃣ Prepare FormData
  //       const formData = new FormData();
  //        formData.append('student', new Blob([JSON.stringify(this.student)], { type: 'application/json' }));
  //         formData.append('marks', new Blob([JSON.stringify(this.studentMarks)], { type: 'application/json' })); 
  //         if (this.selectedFile) { formData.append('file', this.selectedFile); }

  //       // 4️⃣ Call backend endpoint
  //       this.commonService.saveWithFile(formData).subscribe({
  //         next: (response: any) => {
  //           if (response) {
  //             this.messageService.add({
  //               severity: 'success',
  //               summary: 'Created',
  //               detail: 'Student created successfully!',
  //               life: 3000
  //             });

  //             // Reset form
  //             this.student = new Student();
  //             this.selectedFile = null;
  //             this.previewUrl = null;
  //             this.studentMarks = [];
  //             this.visibleForm = false;

  //             this.loadPage(0); // Refresh list
  //           } else {
  //             this.messageService.add({
  //               severity: 'error',
  //               summary: 'Failed',
  //               detail: 'Cannot save!',
  //               life: 3000
  //             });
  //           }
  //         },
  //         error: () => {
  //           this.messageService.add({
  //             severity: 'error',
  //             summary: 'Error',
  //             detail: 'Failed to save student.',
  //             life: 3000
  //           });
  //         }
  //       });
  //     },
  //     error: () => {
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'Error',
  //         detail: 'Failed to check email.',
  //         life: 3000
  //       });
  //     }
  //   });
  // }

  // save student with subject,marks and file
  saveWithFileAndMarks() {
    const studentData: any = { ...this.student };
    delete studentData.studentID; // ✅ remove studentID

    // ✅ attach marks
    studentData.marks = this.studentMarks.map(sm => ({
      subjectName: sm.subject,
      mark: sm.mark
    }));

    const formData = new FormData();
    formData.append('student', new Blob([JSON.stringify(studentData)], { type: 'application/json' }));

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.commonService.saveStudentWithMark(formData).subscribe({
      next: res => {
        this.messageService.add({
          severity: 'success',
          summary: 'Created',
          detail: 'Student created successfully!',
          life: 3000
        });
        this.student = new Student();
        this.selectedFile = null;
        this.previewUrl = null;
        this.studentMarks = [];
        this.visibleForm = false;
        this.loadPage(0); // Refresh list
      },
      error: err => this.messageService.add({
        severity: 'error',
        summary: 'Failed',
        detail: 'Error saving student',
        life: 3000
      })
    });

  }
  // for student update or edit to display dialog box
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
    // --- Fetch marks for this student ---
    this.commonService.getStudentMarks(student.studentID).subscribe(
      (marks: any[]) => {
        // Map backend marks to the form model
        this.studentMarks = marks.map(m => ({
          subject: this.getSubjectName(m.subjectCode), // convert code -> name
          mark: m.mark
        }));
        console.log("Loaded marks:", this.studentMarks);
      },
      (error) => {
        console.error("Failed to load student marks", error);
        this.studentMarks = []; // fallback
      }
    );
  }
  // Inside StudentListComponent
  getSubjectName(code: number): string {
    // Make sure `this.subjects` contains all subjects loaded from backend
    const subject = this.subjects.find(s => s.subjectCode === code);
    return subject ? subject.subjectName : 'Unknown';
  }
  
  // for update button when to update
  updateStudent() {
    if (!this.student.studentName || !this.student.fatherName || !this.student.email || !this.student.nrcNo || !this.student.grade) {
      this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Please fill in all important fields', life: 3000 });
      return;
    }
    // if(this.emailExists){
    //   this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Email is already Exist!!', life: 3000 });
    //   return;
    // }
    // if(this.nrcExists){
    //   this.messageService.add({severity:'error',summary:'Failed',detail:'This NRC no. is already Exist!!'});
    //   return;
    // }

    // Prepare DTO for marks
    const marksDTO = this.studentMarks.map(sm => ({
      subjectName: sm.subject,
      mark: sm.mark
    }));
    const studentDetailDTOReq = {
      studentID: this.student.studentID,
      marks: marksDTO
    };
    this.commonService.updateStudent(this.student, this.selectedFile).subscribe({
      next: (studentResp: any) => {

        // 2️⃣ Update marks
        this.commonService.updateStudentMarks(studentDetailDTOReq).subscribe({
          next: (marksResp: any) => {
            this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Student updated successfully!', life: 3000 });

            // Reset form
            this.student = new Student();
            this.studentMarks = [];
            this.selectedFile = null;
            this.previewUrl = null;
            this.visibleForm = false;

            // Reload page
            this.loadPage(this.offset);
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Marks could not be updated!', life: 3000 });
          }
        });
      },
      error: err => {
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Student info could not be updated!', life: 3000 });
      }
    });
  }
  //reset dialog box
  ResetStudentForm() {
    this.student = new Student();
    this.previewUrl = 'assets/imges/default.jpg';
    this.selectedFileName = '';
    this.emailExists = false;
    this.nrcExists = false;
    this.isViewOnly = false;
  }
  //close dialog box
  CloseDialog() {
    this.visibleForm = false;
  }

  // Load a page from the backend 10 records at a time
  loadPage(offset: number): void {
    this.offset = offset;
    this.commonService.getByOffsetAndLimit(this.offset, this.limit).subscribe(res => {
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
    if (this.offset + this.limit < this.totalRecords) {
      this.loadPage(this.offset + this.limit);
    } else {
      // End of paging
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'End of records! Switch to "View All" to see all records.', life: 3000 });
    }
  }
  // Go to previous pagination
  previous(): void {
    if (this.offset > 0) {
      this.loadPage(Math.max(this.offset - this.limit, 0));
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
    this.searchKeyword = '';
  }

  //  Open confirmation dialog
  openExportDialog(): void {
    this.displayDownloadDialog = true;
  }

  //for delete dialog box 
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
        this.loadPage(this.offset);
      } else {
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Delete failed.', life: 3000 });
      }
      this.displayDeleteDialog = false;
      this.studentToDelete = null;
    });
  }
  // ---- IMAGE UPLOAD ----
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = e => this.previewUrl = reader.result;
      reader.readAsDataURL(file);
    }
  }

  // ---- EXCEL IMPORT ----
  onExcelSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      this.commonService.importStudents(formData).subscribe({
        next: (res: any) => {
          let detailMsg = `Imported ${res.imported} students`;
          if (!res.messages?.length) {
            this.messageService.add({
              severity: 'success',
              summary: 'Import Successful',
              detail: detailMsg,
              life: 5000
            });
          }

          if (res.messages?.length) {
            detailMsg += `\n⚠ ${res.messages.length} issues:\n${res.messages.join('\n')}`;
            this.messageService.add({
              severity: 'error',
              summary: 'Import Result',
              detail: detailMsg,
              life: 8000
            });
          }
          this.loadPage(0); // refresh list
          event.target.value = '';
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Import Failed',
            detail: err.error?.error || 'Unknown error',
            life: 5000
          });
          event.target.value = '';
        }
      });
    }
  }
  //email check if exits or not
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
  //for NRC number check
  onNrcBlur(): void {
    if (!this.studentRegi) return;
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
  //for exportExcel
  exportExcel(studentId: number): void {
    this.commonService.exportExcelByID(studentId).subscribe({
      next: (blob) => {
        this.downloadBlob(blob, `Student_${studentId}.xlsx`);
      },
      error: (error) => {
        console.error("Export failed", error);
      }
    });
  }
  exportExcelByPageorAll(): void {
    const keyword = this.searchKeyword.trim();
    if (!keyword) {

      this.commonService.exportAll().subscribe({
        next: (blob) => {
          this.downloadBlob(blob, `All_STUDENTS.xlsx`);

          this.displayDownloadDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Export successful! File downloaded.', life: 3000 });
        },
        error: (error) => {
          console.error("Export failed", error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Export failed!', life: 3000 });
        }
      });
    } else {
      // Has search keyword → export only searched data
      this.commonService.exportExcelBySearch(keyword).subscribe({
        next: (blob) => {
          // console.log('Exporting searched data for keyword:', keyword);
          if (keyword === 'male') {
            this.downloadBlob(blob, `Male_Students.xlsx`);
          } else if (keyword === 'female') {
            this.downloadBlob(blob, `Female_Students.xlsx`);
          } else {
            this.downloadBlob(blob, `Searched_Students.xlsx`);
          }
          this.displayDownloadDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Export successful! File downloaded.', life: 3000 });
        },
        error: (error) => {
          console.error('Export failed', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Export failed!', life: 3000 });
        }
      });
    }
  }
  // Utility method to trigger download
  private downloadBlob(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  isNumberSearch(keyword: string): boolean {
    return /^[1-9]$/.test(keyword); // checks numbers 1 to 9

  }
  // Validate mark input
  validateMark(index: number) {
    let mark = Number(this.studentMarks[index].mark) || 0;
    if (mark < 0) mark = 0;
    else if (mark > 100) mark = 100;
    this.studentMarks[index].mark = mark;
  }
}