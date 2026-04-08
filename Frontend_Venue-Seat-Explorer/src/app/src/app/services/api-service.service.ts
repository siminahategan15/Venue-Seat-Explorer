import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environment';

@Injectable({
  providedIn: 'root',
})
export class ApiServiceService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getApi() {
    return this.http.get(this.apiUrl);
  }
}
