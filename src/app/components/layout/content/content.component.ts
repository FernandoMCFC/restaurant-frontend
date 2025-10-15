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
  
  :host { 
    display:block; 
    height:100%;
    min-height:0;
  }

  .content {
    background: transparent;
    width: 100%;
    margin: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .content-inner {
    display: grid;
    gap: 1rem;
    background: var(--p-surface-0);
    border: 1px solid var(--p-content-border-color, var(--p-surface-200));
    border-radius: 12px;
    box-shadow: var(--p-shadow-1);

    
    padding-top: 0;
    padding-bottom: 1rem;
    padding-left: 0;
    padding-right: 0;

    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  
  router-outlet {
    display: contents;
  }

  @media (min-width: 992px) {
    .content-inner {
      padding-top: 0;          
      padding-bottom: 1.25rem;
      padding-left: 0;
      padding-right: 0;
      gap: 1.25rem;
    }
  }
  `]
})
export class ContentComponent {}
