import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getToken()}`
    });
  }

  getMyReservations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my`, {
      headers: this.getHeaders()
    });
  }

  getAllReservations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  getFieldAvailability(fieldId: string, date: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/availability/${fieldId}?date=${date}`
    );
  }

  createReservation(data: {
    fieldId: string;
    date: string;
    startTime: string;
    endTime: string;
  }): Observable<any> {
    return this.http.post(this.apiUrl, data, { headers: this.getHeaders() });
  }

  cancelReservation(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/cancel`, {}, {
      headers: this.getHeaders()
    });
  }

  updateReservation(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data, {
      headers: this.getHeaders()
    });
  }
}