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

  uploadMedia(seatId: string, file: File, caption?: string): Observable<Media> {
    const formData = new FormData();
    formData.append('image', file);
    if (caption) {
      formData.append('caption', caption);
    }
    return this.http.post<Media>(`${this.apiUrl}/upload/${seatId}`, formData);
  }

  deleteMedia(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
