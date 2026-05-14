import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Review } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/api/reviews`;

  constructor(private http: HttpClient) {}

  getReviewsBySeat(seatId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/seat/${seatId}`);
  }

  getReviewsByVenue(venueId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/venue/${venueId}`);
  }

  createReview(review: Partial<Review>): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, review);
  }

  updateReview(id: string, review: Partial<Review>): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${id}`, review);
  }

  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  flagReview(reviewId: string, reason: string) {
    return this.http.post(`${this.apiUrl}/${reviewId}/flag`, { reason });
  }

  censorReview(reviewId: string, data: any) {
    return this.http.post(`${this.apiUrl}/${reviewId}/censor`, data);
  }

  getFlaggedReviews(venueId: string) {
    return this.http.get<any[]>(`${this.apiUrl}/flagged/${venueId}`);
  }
}
