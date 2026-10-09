import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Session } from '../models/session';
import { Acta } from '../models/acta';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConsultationService {
  private apiUrl = environment.urlApi;

  constructor(private http: HttpClient) {}

  // ADMIN
  inProgress(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/consultation/sessions/in-progress`);
  }

  editableAgendas(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/consultation/sessions/editable-agendas`);
  }

  upcoming(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/consultation/sessions/upcoming`);
  }

  // MIEMBRO JD
  actasByPresenter(id: number): Observable<Acta[]> {
    return this.http.get<Acta[]>(`${this.apiUrl}/consultation/actas/presenter/${id}`);
  }

  actasByResponsible(id: number): Observable<Acta[]> {
    return this.http.get<Acta[]>(`${this.apiUrl}/consultation/actas/responsible/${id}`);
  }

  absentSessions(id: number): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/consultation/sessions/absent/${id}`);
  }

  // AMBOS
  sessionsByRange(start: string, end: string): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/consultation/sessions/range?start=${start}&end=${end}`);
  }

  actaById(id: number): Observable<Acta | null> {
    return this.http.get<Acta | null>(`${this.apiUrl}/consultation/actas/${id}`);
  }
  
}

