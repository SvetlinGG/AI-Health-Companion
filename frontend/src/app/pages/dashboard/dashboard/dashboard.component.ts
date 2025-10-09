import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SearchBoxComponent } from '../../../components/search-box/search-box/search-box.component';
import { DataVizComponent } from '../../../components/data-viz/data-viz/data-viz.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SearchBoxComponent, DataVizComponent ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private api = inject(ApiService);
  results: {title: string, snippet: string, url: string}[] = [];
  chartData = [
    {label: 'Q&A', value: 18},
    {label: 'Search', value: 12},
    {label: 'Tips', value: 7},
    {label: 'Other', value: 4},
  ];
  onSearch(q: string){
    this.api.search(q).subscribe({
      next: (rows) => this.results = rows,
      error: () => this.results = []
    });
  }

}
