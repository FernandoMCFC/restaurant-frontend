import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  template: `
    <div class="grid">
      <div class="col-12 md:col-6 lg:col-4">
        <div class="card-metric surface-card border-round p-3 shadow-1">
          <div class="flex align-items-center justify-content-between">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-shopping-bag text-2xl"></i>
              <span class="text-xl font-semibold">Órdenes</span>
            </div>
            <span class="text-2xl font-bold">128</span>
          </div>
          <div class="mt-2 text-color-secondary">Últimas 24h</div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './dashboard.page.css'
})
export class DashboardPage {}
