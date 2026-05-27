import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Section } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SectionService {
  private apiUrl = `${environment.apiUrl}/api/sections`;

  constructor(private http: HttpClient) {}

  getSectionsByVenue(venueId: string): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.apiUrl}/venue/${venueId}`);
  }

  getSectionById(id: string): Observable<Section> {
    return this.http.get<Section>(`${this.apiUrl}/${id}`);
  }

  createSection(section: Partial<Section>): Observable<Section> {
    return this.http.post<Section>(this.apiUrl, section);
  }

  updateSection(id: string, section: Partial<Section>): Observable<Section> {
    return this.http.put<Section>(`${this.apiUrl}/${id}`, section);
  }

  deleteSection(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
