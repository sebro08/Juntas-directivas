import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Decision } from '../models/decision';

@Injectable({ providedIn: 'root' })
export class DecisionService {
  private baseUrl = environment.urlApi;

  constructor(private http: HttpClient) {}

  getDecisionsByPoint(pointId: number): Observable<Decision[]> {
    return this.http.get<Decision[]>(`${this.baseUrl}/points/${pointId}/decisions`);
  }

  createDecision(decision: Partial<Decision>): Observable<Decision> {
    return this.http.post<Decision>(`${this.baseUrl}/decisions/create`, decision);
  }

  deleteDecision(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/decisions/${id}`);
  }
}