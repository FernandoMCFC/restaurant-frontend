import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <span>© {{year}} Web App Restaurant</span>
    </footer>
  `,
  styles: [`
    :host { display:block; }
    .footer {
      padding: .75rem 1rem;
      border-top: 1px solid var(--p-content-border-color, var(--p-surface-200));
      background: var(--p-surface-card);
      color: var(--p-text-muted-color);
      font-size: .875rem;
    }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
}
