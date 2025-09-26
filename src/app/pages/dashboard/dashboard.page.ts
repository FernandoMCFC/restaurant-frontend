import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [CommonModule],
  template: `
    <section class="grid" style="gap:1rem">
      <div class="p-3 border-round surface-card" style="border:1px solid var(--p-surface-200)">
        <h2 class="m-0">Dashboard</h2>
        <p class="m-0">Bienvenido. Aqui podras ver toda la informacion de tu restaurant.</p>
      </div>
    </section>
  `,
  styles: [``]
})
export class DashboardPage {}
