import { Note } from '../models/note';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private baseUrl = environment.urlApi;

  constructor(private http: HttpClient) {}

  getNotesByPoint(pointId: number): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.baseUrl}/points/${pointId}/notes`);
  }

  createNote(note: Partial<Note>): Observable<Note> {
    return this.http.post<Note>(`${this.baseUrl}/notes/create`, note);
  }

  deleteNote(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/notes/${id}`);
  }
}