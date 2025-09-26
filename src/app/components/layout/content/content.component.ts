import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <main class="content">
      <div class="content-inner">
        <router-outlet></router-outlet>
      </div>
    </main>
  `,
  
    styles: [`
    :host { display:block; }

    /* El .shell-body ya maneja scroll y gutters.
       Aquí solo dibujamos la "card" de contenido. */
    .content {
      background: transparent;
    }

    .content-inner {
      display: grid;
      gap: 1rem;
      background: var(--p-surface-0);  /* card blanca principal */
      border: 1px solid var(--p-content-border-color, var(--p-surface-200));
      border-radius: 12px;
      box-shadow: var(--p-shadow-1);
      padding: 1rem;
    }

    @media (min-width: 992px) {
      .content-inner { padding: 1.25rem; gap: 1.25rem; }
    }
  `]


})
export class ContentComponent {}
