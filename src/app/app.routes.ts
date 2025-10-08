import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { StudentListComponent } from './components/student-list/student-list.component';
import { DeleteStudentComponent } from './components/delete-student/delete-student.component';
import { SerachStudentComponent } from './components/serach-student/serach-student.component';


export const routes: Routes = [
   { path: 'student/edit/:studentID', component: HomeComponent },
   {path:'student/save',component:HomeComponent},
   {path:'',component:StudentListComponent},
   {path:'student/list',component:StudentListComponent},
   {path:'student/delete',component:DeleteStudentComponent},
   {path:'student/search',component:SerachStudentComponent}

];
