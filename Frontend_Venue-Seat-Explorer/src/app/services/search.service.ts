import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Venue, Seat, Section } from '../models';

export interface SearchResults {
  venues: Venue[];
  sections: Section[];
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private apiUrl = `${environment.apiUrl}/api/search`;

  constructor(private http: HttpClient) {}

  searchAll(query: string): Observable<SearchResults> {
    const params = new HttpParams().set('q', query);
    return this.http.get<SearchResults>(this.apiUrl, { params });
  }

  searchVenues(query: string): Observable<Venue[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Venue[]>(`${this.apiUrl}/venues`, { params });
  }

  searchSeats(filters: {
    venueId?: string;
    sectionId?: string;
    row?: number;
  }): Observable<Seat[]> {
    let params = new HttpParams();
    if (filters.venueId) params = params.set('venueId', filters.venueId);
    if (filters.sectionId) params = params.set('sectionId', filters.sectionId);
    if (filters.row) params = params.set('row', filters.row.toString());
    return this.http.get<Seat[]>(`${this.apiUrl}/seats`, { params });
  }
}
