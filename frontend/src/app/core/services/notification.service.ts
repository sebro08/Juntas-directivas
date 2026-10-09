import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import {Notification} from "../models/notification";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.urlApi}/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications(email: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/${email}`);
  }

  markAsRead(id: number) {
    return this.http.patch(`${this.apiUrl}/${id}/read`, {});
  }

  deleteNotification(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  clearNotifications(email: string) {
    return this.http.delete(`${this.apiUrl}/clear/${email}`);
  }
}
