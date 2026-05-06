import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private http: HttpClient) {}

  askAI(message: string): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/chat/ask`, { message: message });
  }
}