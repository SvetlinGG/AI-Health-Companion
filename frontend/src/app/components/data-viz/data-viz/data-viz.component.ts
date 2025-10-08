import { CommonModule } from '@angular/common';
import { Component, computed, Input } from '@angular/core';

@Component({
  selector: 'app-data-viz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-viz.component.html',
  styleUrl: './data-viz.component.css'
})
export class DataVizComponent {
  @Input() data: {label: string, value: number}[] = [];
  width = 600; height = 200; barWidth = 32; gap = 16;

  normalized = computed( () => {
    const max = Math.max(...this.data.map(d => d.value), 1);
    const scale = (v: number) => (v / max) * (this.height - 24);
    return this.data.map(d => ({...d, h: scale(d.value)}))
  });

}

