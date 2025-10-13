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
  /* === Mantiene tu diseño, pero habilita alto y overflow para scroll interno en hijos === */
  :host { 
    display:block; 
    height:100%;       /* clave */
    min-height:0;      /* clave */
  }

  .content {
    background: transparent;
    width: 100%;
    margin: 0;

    /* NUEVO: que ocupe el alto, sin permitir scroll global aquí */
    display: flex;
    flex-direction: column;
    height: 100%;      /* clave */
    min-height: 0;     /* clave */
    overflow: hidden;  /* delega el scroll al contenido hijo */
  }

  .content-inner {
    /* conservamos tu grid y estilos visuales */
    display: grid;
    gap: 1rem;
    background: var(--p-surface-0);
    border: 1px solid var(--p-content-border-color, var(--p-surface-200));
    border-radius: 12px;
    box-shadow: var(--p-shadow-1);

    /* paddings iguales a tu archivo */
    padding-top: 1rem;
    padding-bottom: 1rem;
    padding-left: 0;
    padding-right: 0;

    /* NUEVO: permitir que el hijo (Orders) maneje scroll interno */
    height: 100%;      /* clave */
    min-height: 0;     /* clave */
    overflow: hidden;  /* el hijo decide dónde scrollear */
  }

  @media (min-width: 992px) {
    .content-inner {
      padding-top: 1.25rem;
      padding-bottom: 1.25rem;
      padding-left: 0;
      padding-right: 0;
      gap: 1.25rem;
    }
  }
`]
})
export class ContentComponent {}
