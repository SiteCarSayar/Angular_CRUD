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
  getFileById(id:number){
    return this.httpClient.get(this.apiRoute+"/student/download/"+id,{ responseType: 'blob' });
  }

  //pagination
 getByOffsetAndLimit(offset: number, limit: number) {
  return this.httpClient.get<any>(
    `${this.apiRoute}/student/getByOffsetAndLimit?offset=${offset}&limit=${limit}`
  );
}
  save(student:Student){
    return this.httpClient.post(this.apiRoute+"/student/create",student);
  }

  saveWithFile(student: Student, file: File  | null): Observable<any> {
  const formData = new FormData();
  //  Convert student object into a JSON blob (important for @RequestPart("student"))
  formData.append('student', new Blob([JSON.stringify(student)], { type: 'application/json' }));
  //  Append the file
  if (file) {
    formData.append('file', file);
  }
  //  Call backend endpoint
  return this.httpClient.post(`${this.apiRoute}/student/creating`, formData);
}


  updateStudent(student:Student,file:File | null): Observable<any> {
    const formData = new FormData();
    formData.append('student',new Blob([JSON.stringify(student)], { type: 'application/json' }));
    if(file){
      formData.append('file',file);
    }
    return this.httpClient.put(this.apiRoute+"/student/update/"+student.studentID,formData);
  }

  deleteStudent(student:Student){
    return this.httpClient.delete(this.apiRoute+"/student/delete/"+student.studentID, { responseType: 'text' });
  }

  //search by name or id
  searchByNameOrId(keyword: string): Observable<Student[]> {
    return this.httpClient.get<Student[]>(`${this.apiRoute}/student/Search?keyword=${keyword}`);
  }

  //check email exist
  checkEmailExist(email: String): Observable<boolean> {
    return this.httpClient.get<boolean>(`${this.apiRoute}/student/checkEmail?email=${email}`);
  }

  //check nrc exist
  checkNrcExist(nrcNo: String): Observable<boolean> {
    return this.httpClient.get<boolean>(`${this.apiRoute}/student/checkNrcNo?nrcNo=${nrcNo}`);
  }

  exportExcelByID(id:number){
    return this.httpClient.get(this.apiRoute+"/student/export/"+id,{ responseType: 'blob' });
  }
  exportAll(){
    return this.httpClient.get(this.apiRoute+"/student/exportAll",{ responseType: 'blob' });
  }

  exportExcelByPage(offset: number, limit: number) {
    return this.httpClient.get(this.apiRoute+"/student/exportByPage?offset="+offset+"&limit="+limit, { responseType: 'blob' });
  }
  exportExcelBySearch(keyword: string) {
    return this.httpClient.get(this.apiRoute+"/student/exportBysearch?keyword="+keyword, { responseType: 'blob' });
  }
}
