import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Student } from '../entity/student';



@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private apiRoute = 'http://localhost:8080';

  constructor( private httpClient:HttpClient) { }

  getAllStudent(): Observable<Student[]> {
    return this.httpClient.get<Student[]>(this.apiRoute+"/student/all");

  }
  getById(id:number){
    return this.httpClient.get(this.apiRoute+"/student/"+id)
  }

  save(student:Student){
    return this.httpClient.post(this.apiRoute+"/student/create",student);
  }
  saveWithFile(student: Student, file: File): Observable<any> {
  const formData = new FormData();

  //  Convert student object into a JSON blob (important for @RequestPart("student"))
  formData.append('student', new Blob([JSON.stringify(student)], { type: 'application/json' }));

  //  Append the file
  formData.append('file', file);

  //  Call backend endpoint
  return this.httpClient.post(`${this.apiRoute}/student/creating`, formData);
}



  updateStudent(student:Student){
    return this.httpClient.put(this.apiRoute+"/student/update/"+student.studentID,student);
  }

  deleteStudent(student:Student){
    return this.httpClient.delete(this.apiRoute+"/student/delete/"+student.studentID, { responseType: 'text' });
  }

}
