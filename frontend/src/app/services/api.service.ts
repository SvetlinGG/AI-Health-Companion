import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root'})
export class ApiService {
  // signals for chat state
  messages = signal<{ role: 'user' | 'assistant', text: string, sources?: {title:string, url:string}[] }[]>([]);
  loading = signal(false);

  constructor(private http: HttpClient) { }

  async ask(question: string){
    this.loading.set(true);
    this.messages.update(m => [...m, {role: 'user', text: question}]);

    try {
      const res = await this.http.post<{answer:string, sources?:{title:String, url:String}[] }>(
        `${environment.apiBase}/ask`,
        { question }
      ).toPromise();
      this.messages.update(m => [...m, { role: 'assistant', text: res?.answer ?? "", sources: res?.sources}]);
    } catch (e) {
      this.messages.update(m => [...m, {role: 'assistant', text: '⚠️ Error contacting server.'}]);
    }finally{
      this.loading.set(false);
    }
  }

  // search API ( Elastic passthrough)
  search(query: string){
    return this.http.get<{title: String, snippet: String, url: string}[]>(
      `${environment.apiBase}/search`, {params: { q: query}}
    );
  }

  // Example analytics endpoint for dashboard widgets
  analyticsSnapshot(){
    return this.http.get<{ label: String, value: number}[]>(
      `${environment.apiBase}/analytics/snapshot`
    );
  }
}
