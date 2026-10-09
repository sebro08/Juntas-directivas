import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Session} from '../models/session';
import {Observable} from 'rxjs';
import {Modality} from '../models/modality';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private baseUrl = environment.urlApi;

  constructor(private http: HttpClient) { }

  getSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.baseUrl}/sessions`);
  }

  getModalities(): Observable<Modality[]> {
    return this.http.get<Modality[]>(`${this.baseUrl}/modalities`);
  }

  createSession(session: any) {
    return this.http.post<Session>(`${this.baseUrl}/sessions/create`, session);
  }

  getTodaySessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.baseUrl}/session/execution`);
  }

  getSessionById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/sessions/execution/${id}/details`);
  }

  updateAttendance(participantId: number, attended: boolean) {
    return this.http.put(`${this.baseUrl}/session-participants/${participantId}/attendance`, { attended });
  }

  uploadAgendaFile(formData: FormData) {
    return this.http.post<{ filePath: string }>(`${this.baseUrl}/files/agenda/upload`, formData);
  }

  updateSessionStatus(sessionId: number, statusId: number) {
    return this.http.put(`${this.baseUrl}/sessions/${sessionId}/status`, { statusId });
  }

  updateVoteResult(pointId: number, voteResult: number) {
    return this.http.put(`${this.baseUrl}/agenda-items/${pointId}/vote-result`, { voteResult });
  }

  updateSession(id: number, data: any) {
    return this.http.put(`${environment.urlApi}/sessions/${id}`, data);
  }
}
