import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Seat } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SeatService {
  private apiUrl = `${environment.apiUrl}/api/seats`;

  constructor(private http: HttpClient) {}

  getSeatsByVenue(venueId: string): Observable<Seat[]> {
    return this.http.get<Seat[]>(`${this.apiUrl}/venue/${venueId}`);
  }

  getSeatById(id: string): Observable<Seat> {
    return this.http.get<Seat>(`${this.apiUrl}/${id}`);
  }

  createSeat(seat: Partial<Seat>): Observable<Seat> {
    const payload = {
      venueId: seat.venueId,
      sectionId: seat.sectionId,
      row: seat.row,
      seatNumber: seat.seatNumber,
      x: seat.x,
      y: seat.y,
    };
    return this.http.post<Seat>(`${this.apiUrl}`, payload);
  }

  updateSeat(id: string, seat: Partial<Seat>): Observable<Seat> {
    return this.http.put<Seat>(`${this.apiUrl}/${id}`, seat);
  }

  deleteSeat(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
