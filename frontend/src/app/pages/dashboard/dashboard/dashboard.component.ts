import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SearchBoxComponent } from '../../../components/search-box/search-box/search-box.component';
import { DataVizComponent } from '../../../components/data-viz/data-viz/data-viz.component';
import { ApiService } from '../../../services/api.service';

interface AnalyticsSnapshot {
  dailyUsage?: { d: string; events: number }[];
  topDomains?: { domain: string; c: number }[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SearchBoxComponent, DataVizComponent ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);
  results: {title: string, snippet: string, url: string}[] = [];
  chartData = [
    {label: 'Q&A', value: 18},
    {label: 'Search', value: 12},
    {label: 'Tips', value: 7},
    {label: 'Other', value: 4},
  ];
  onSearch(q: string){
    this.api.search(q)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rows) => this.results = rows,
        error: () => this.results = []
      });
  }
  
ngOnInit() {
  this.api.analyticsSnapshot()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (snap: AnalyticsSnapshot) => {
        if (snap.dailyUsage) {
          this.chartData = snap.dailyUsage.map((r) => ({
            label: r.d || 'Unknown', 
            value: Number(r.events || 0)
          }));
        }
        if (snap.topDomains) {
          this.results = snap.topDomains.map((r) => ({
            title: r.domain || 'Unknown',
            url: `https://${r.domain || 'example.com'}`,
            snippet: `Count: ${r.c || 0}`
          }));
        }
      },
      error: (err) => console.error('Analytics error:', err)
    });
}


}
