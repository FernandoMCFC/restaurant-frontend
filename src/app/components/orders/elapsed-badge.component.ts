import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';

@Component({
  selector: 'app-elapsed-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="elapsed-badge" [title]="startDate ? (startDate | date:'short') : ''">
      ⏱ {{ label }}
    </span>
  `,
  styles: [`
    .elapsed-badge{
      display:inline-block;
      padding:4px 8px;
      border-radius:999px;
      background: var(--p-surface-100);
      color: var(--p-text-color);
      font-size:.85rem;
      font-weight:600;
      line-height:1;
      white-space:nowrap;
    }
  `]
})
export class ElapsedBadgeComponent implements OnInit, OnDestroy {
  /** Fecha/hora del pedido (ISO o Date). Si falta, muestra "—". */
  @Input() start!: string | Date | null | undefined;

  startDate: Date | null = null;
  label = '—';
  private timer: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.startDate = this.start ? new Date(this.start) : null;
    this.updateLabel();
    this.timer = setInterval(() => {
      this.updateLabel();
      this.cdr.markForCheck();
    }, 60_000); // refresca cada 60 s
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  private updateLabel() {
    if (!this.startDate || isNaN(this.startDate.getTime())) {
      this.label = '—';
      return;
    }
    const diffMs = Date.now() - this.startDate.getTime();
    const mins = Math.max(0, Math.floor(diffMs / 60000));
    if (mins < 60) {
      this.label = `${mins} min`;
      return;
    }
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    this.label = `${h} h ${m} min`;
  }
}
