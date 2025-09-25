import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, Card, Button, RouterLink],
  template: `
    <div class="kpis">
      <p-card header="Ordenes"><p>52</p></p-card>
      <p-card header="Ventas"><p>Bs 2.100</p></p-card>
     
    </div>

    <div class="mt">
      <a pButton routerLink="/app/settings/restaurant" label="Configurar Restaurant" icon="pi pi-cog"></a>
    </div>
  `,
  styles: [`
    .kpis{ display:grid; gap:1rem; grid-template-columns:1fr; }
    @media (min-width: 1200px){ .kpis{ grid-template-columns: repeat(4, 1fr); } }
    .mt{ margin-top:1rem; }
  `]
})
export class DashboardPage {}
