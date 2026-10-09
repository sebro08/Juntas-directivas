import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Settings} from '../models/settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private baseUrl = environment.urlApi;

  constructor(private http: HttpClient) { }

  getSettings(): Observable<Settings> {
    return this.http.get<Settings>(this.baseUrl + '/settings');
  }

  saveSettings(data: Settings): Observable<any> {
    return this.http.put(this.baseUrl + '/settings', data);
  }
}
