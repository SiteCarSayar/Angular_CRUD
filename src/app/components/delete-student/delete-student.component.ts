import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../service/common.service';
import { Student } from '../entity/student';

declare var bootstrap: any; // Needed to open Bootstrap modal programmatically

@Component({
  selector: 'app-delete-student',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './delete-student.component.html',
  styleUrls: ['./delete-student.component.css']
})
export class DeleteStudentComponent {

  student: Student = new Student();
  studentId: number | null = null;

  modalTitle = '';
  modalMessage = '';

  constructor(private commonService: CommonService) {}

  deleteStudent() {
    if (this.studentId == null) {
      this.showModal('Error', 'Please enter a Student ID.');
      return;
    }

    // Optional info about the ID
    this.showModal('Info', 'Student ID is ' + this.studentId);

    // Call delete API
    this.commonService.deleteStudent(this.student).subscribe(
      (response: any) => {
        if (response) {
          this.showModal('Success', 'Deleted Successfully!');
          this.reset();
        } else {
          this.showModal('Failed', 'Delete failed.');
        }
      },
      () => {
        this.showModal('Error', 'Something went wrong.');
      }
    );
  }

  reset() {
    this.studentId = null;
  }

  // Open Bootstrap modal
  showModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;

    const modalEl = document.getElementById('alertModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }
}
