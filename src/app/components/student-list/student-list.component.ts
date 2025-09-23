// import { Component, OnInit } from '@angular/core';
// import { Student } from '../student';
// import { CommonService } from '../common.service';
// import { Router } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';


// @Component({
//   selector: 'app-student-list',
//   standalone: true,
//   imports: [FormsModule,CommonModule],
//   templateUrl: './student-list.component.html',
//   styleUrl: './student-list.component.css'
// })
// export class StudentListComponent implements OnInit{
  
//   student:Student=new Student();
//   studentList:Student[]=[];

//   ngOnInit(): void {
    
//   }
  

//   constructor(private commonService:CommonService,private router:Router){}

//   // getAllStudent(){
//   //   debugger;
//   //   this.commonService.getAllStudent(this.student).subscribe((response:any)=>{
//   //     if(response.student){
//   //       this.studentList=response.data;
//   //     }else{
//   //       window.alert("Not FOund");
//   //     }
//   //   })
//   // }
// this.commonService.getAllStudent().subscribe({
//   next: (students: Student[]) => {
//     if (students && students.length > 0) {
//       this.studentList = students;
//     } else {
//       alert("No students found");
//     }
//   },
//   error: (error) => {
//     console.error("Error fetching students:", error);
//     alert("Error fetching student data");
//   },
//   complete: () => {
//     console.log("Fetching students completed");
//   }
// });




// }
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
