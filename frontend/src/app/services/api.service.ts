import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root'})
export class ApiService {
  // signals for chat state
  messages = signal<{ role: 'user' | 'assistant', text: string, sources?: {title:string, url:string}[] }[]>([]);
  loading = signal(false);

  constructor(private http: HttpClient) { }
}
