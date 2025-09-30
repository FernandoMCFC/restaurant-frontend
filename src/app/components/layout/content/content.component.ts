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
     Aquí solo dibujamos la "card" de contenido a todo el ancho */
  .content {
    background: transparent;
    width: 100%;
    margin: 0;                 /* sin márgenes */
  }

  .content-inner {
    display: grid;
    gap: 1rem;
    background: var(--p-surface-0);  /* card blanca principal */
    border: 1px solid var(--p-content-border-color, var(--p-surface-200));
    border-radius: 12px;
    box-shadow: var(--p-shadow-1);

    /* ANTES: padding: 1rem (metía “aire” lateral) */
    /* Ahora: sin padding horizontal, solo vertical */
    padding-top: 1rem;
    padding-bottom: 1rem;
    padding-left: 0;
    padding-right: 0;
  }

  @media (min-width: 992px) {
    .content-inner {
      /* ANTES: padding: 1.25rem; */
      padding-top: 1.25rem;
      padding-bottom: 1.25rem;
      padding-left: 0;   /* mantener 0 en desktop */
      padding-right: 0;  /* mantener 0 en desktop */
      gap: 1.25rem;
    }
  }
`]



})
export class ContentComponent {}
