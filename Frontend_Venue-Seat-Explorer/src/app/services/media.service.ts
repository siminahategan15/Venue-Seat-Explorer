import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Media } from '../models';

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  private apiUrl = `${environment.apiUrl}/api/media`;

  constructor(private http: HttpClient) {}

  getMediaBySeat(seatId: string): Observable<Media[]> {
    return this.http.get<Media[]>(`${this.apiUrl}/seat/${seatId}`);
  }

  uploadMedia(
    seatId: string,
    file: File,
    caption?: string,
    venueId?: string,
  ): Observable<Media> {
    const formData = new FormData();
    formData.append('image', file);
    if (caption) {
      formData.append('caption', caption);
    }
    if (venueId) {
      formData.append('venueId', venueId);
    }
    return this.http.post<Media>(`${this.apiUrl}/upload/${seatId}`, formData);
  }

  flagMedia(mediaId: string, reason: string) {
    return this.http.post(`${this.apiUrl}/${mediaId}/flag`, { reason });
  }

  deleteMedia(mediaId: string, data: any) {
    return this.http.delete(`${this.apiUrl}/${mediaId}`, { body: data });
  }

  getFlaggedMedia(venueId: string) {
    return this.http.get<any[]>(`${this.apiUrl}/flagged/${venueId}`);
  }

  markHelpful(mediaId: string) {
    return this.http.post(`${this.apiUrl}/${mediaId}/helpful`, {});
  }

  getMediaByVenue(venueId: string): Observable<Media[]> {
    return this.http.get<Media[]>(`${this.apiUrl}/venue/${venueId}`);
  }
}
