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

  createVenue(venue: Partial<Venue>): Observable<Venue> {
    return this.http.post<Venue>(this.apiUrl, venue);
  }

  updateVenue(id: string, venue: Partial<Venue>): Observable<Venue> {
    return this.http.put<Venue>(`${this.apiUrl}/${id}`, venue);
  }

  deleteVenue(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
