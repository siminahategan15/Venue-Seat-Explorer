import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Venue } from '../models';

@Injectable({
  providedIn: 'root',
})
export class VenueService {
  private apiUrl = `${environment.apiUrl}/api/venues`;

  constructor(private http: HttpClient) {}

  getAllVenues(): Observable<Venue[]> {
    return this.http.get<Venue[]>(this.apiUrl);
  }

  getVenueById(id: string): Observable<Venue> {
    return this.http.get<Venue>(`${this.apiUrl}/${id}`);
  }

  createVenue(venueData: any) {
    return this.http.post<any>(this.apiUrl, venueData);
  }

  getVenueAdminStats() {
    return this.http.get<any>(`${this.apiUrl}/admin/stats`);
  }

  updateVenue(id: string, data: any) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteVenue(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
