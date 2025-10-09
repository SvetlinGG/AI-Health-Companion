import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SearchBoxComponent } from '../../../components/search-box/search-box/search-box.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SearchBoxComponent, ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  

}
