// src/app/components/orders/order-card.component.ts
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { Order } from '../../pages/orders/orders.types';

@Component({
  selector: 'app-order-card',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CommonModule, ButtonModule, RippleModule],
  template: `
    <article class="order-card" [class.is-new]="isNew" (click)="seen.emit(order.id)">
      <header class="order-head">
        <div class="left">
          <!-- Tipo + número de mesa (si corresponde) -->
          <span
            class="chip type"
            [class.mesa]="order.type === 'MESA'"
            [class.llevar]="order.type === 'LLEVAR'">
            {{ order.type === 'MESA' ? (tableLabel ?? 'Mesa') : 'Para llevar' }}
          </span>

          <!-- Estado en la MISMA FILA -->
          <span
            class="chip status"
            [class.prep]="order.status === 'EN_PREPARACION'"
            [class.done]="order.status === 'ENTREGADO'"
            [class.cancel]="order.status === 'CANCELADO'">
            {{
              order.status === 'EN_PREPARACION'
                ? 'En preparación'
                : order.status === 'ENTREGADO'
                ? 'Entregado'
                : 'Cancelado'
            }}
          </span>
        </div>

        <!-- Tiempo transcurrido SOLO cuando está en preparación -->
        <span *ngIf="showElapsed" class="elapsed" [title]="startedAt ? (startedAt | date:'short') : ''">
          ⏱ {{ elapsedMinutesLabel }}
        </span>
      </header>

      <ul class="items">
        <li *ngFor="let it of order.items">
          <span class="name">{{ it.qty }} × {{ it.name }}</span>
          <span class="sub">{{ it.price | number: '1.0-0' }} Bs</span>
        </li>
      </ul>

      <div class="total">
        <span>Total</span>
        <strong>{{ order.total | number: '1.0-0' }} Bs</strong>
      </div>

      <div class="actions">
        <button
          pButton
          pRipple
          label="Entregar"
          class="btn deliver p-button-sm"
          (click)="deliver.emit(order.id)"></button>

        <button
          pButton
          pRipple
          label="Cancelar"
          class="btn cancel p-button-sm"
          (click)="cancel.emit(order.id)"></button>

        <!-- Editar solo icono -->
        <button
          class="icon-btn"
          (click)="onEditClick($event)"
          aria-label="Editar"
          title="Editar">
          <img src="/icons/edit.png" alt="Editar" width="18" height="18" />
        </button>
      </div>
    </article>
  `,
  styles: [`
    :host { display:block; }

    /* ===== Tarjeta (ahora con variables para alternar colores) ===== */
    .order-card{
      position:relative;
      border:1px solid var(--card-border, var(--p-surface-200));
      background: var(--card-bg, var(--p-surface-0));
      border-radius:14px;
      padding:14px 14px 12px;
      display:block;
      box-shadow:
        inset 4px 0 0 0 var(--card-accent, transparent),
        0 6px 14px rgba(0,0,0,.04);
      transition: box-shadow .18s ease, transform .12s ease, border-color .18s ease, background .18s ease;
    }
    .order-card:hover{
      box-shadow:
        inset 4px 0 0 0 var(--card-accent, transparent),
        0 10px 22px rgba(0,0,0,.07);
      transform: translateY(-1px);
      border-color: var(--p-surface-300);
    }

    /* Resaltado para pedidos nuevos */
    @keyframes cardPulse {
      0%   { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.30); }
      60%  { box-shadow: 0 10px 30px -10px rgba(250, 204, 21, 0.55); }
      100% { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0); }
    }
    .order-card.is-new {
      background: #fef9c3;          /* amber-100 */
      border-color: #fde68a;        /* amber-200 */
      animation: cardPulse 1.2s ease-in-out 2;
    }

    /* ===== Header ===== */
    .order-head{
      display:flex; justify-content:space-between; align-items:center;
      margin-bottom:10px; gap:12px; flex-wrap:wrap;
    }
    .left{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }

    /* Chips */
    .chip{
      display:inline-flex; align-items:center; gap:6px;
      padding:6px 10px; height:26px;
      border-radius:999px; font-size:12px; font-weight:700;
      border:1px solid transparent;
    }
    .chip.type.mesa   { background: var(--p-blue-50, #eef6ff);   color: var(--p-blue-700, #1e64a3);   border-color: var(--p-blue-200, #bfdcff); }
    .chip.type.llevar { background: var(--p-orange-50, #fff4e5); color: var(--p-orange-700, #b35a00); border-color: var(--p-orange-200, #ffd8a8); }
    .chip.status.prep { background: var(--p-yellow-50, #fff9db); color: var(--p-yellow-800, #8a6a00); border-color: var(--p-yellow-200, #ffe58f); }
    .chip.status.done { background: var(--p-green-50, #eaf7ef);  color: var(--p-green-700, #0f7a3b);  border-color: var(--p-green-200, #cdebd8); }
    .chip.status.cancel { background: var(--p-red-50, #fdecec);  color: var(--p-red-700, #b42318);    border-color: var(--p-red-200, #fac5c3); }

    /* Badge minutos */
    .elapsed{
      display:inline-block; padding:6px 10px; height:26px;
      border-radius:999px; background: var(--p-surface-100);
      color: var(--p-text-color); font-size:.85rem; font-weight:700; line-height:1;
      white-space:nowrap; border:1px dashed var(--p-surface-300);
    }

    /* ===== Items ===== */
    .items{ list-style:none; margin:10px 0 8px; padding:0; display:grid; gap:6px; }
    .items li{ display:flex; justify-content:space-between; align-items:center; }
    .name{ color: var(--p-emphasis-high); font-weight:600; }
    .sub { color: var(--p-emphasis-medium); font-weight:600; }

    /* ===== Total ===== */
    .total{
      display:flex; justify-content:space-between; align-items:center;
      margin: 8px 0 12px; font-size:15px;
      border-top:1px dashed var(--p-surface-300); padding-top:8px;
    }
    .total span{ color: var(--p-emphasis-medium); }

    /* ===== Acciones ===== */
    .actions{ display:flex; gap:10px; align-items:center; }

    /* Botones: apariencia consistente sin tocar eventos */
    .btn.p-button{
      border-radius:10px; height:36px; padding:0 14px; font-weight:800; letter-spacing:.2px;
      box-shadow: 0 2px 0 rgba(0,0,0,.04);
    }
    .btn.deliver{
      background: var(--p-primary-color);
      border: 1px solid color-mix(in srgb, var(--p-primary-color) 85%, black);
      color: var(--p-primary-contrast-color);
    }
    .btn.deliver:hover{ filter: brightness(1.02); transform: translateY(-1px); }

    .btn.cancel{
      background: var(--p-surface-0); color:#b42318; border:1px solid #f2b8b5;
    }
    .btn.cancel:hover{ background:#fff5f5; }

    /* Editar solo icono con mejor área clickeable */
    .icon-btn{
      margin-left:auto; /* se mantiene al final si hay espacio */
      width:36px; height:36px; border-radius:10px;
      background:transparent; border:0; padding:0;
      display:inline-flex; align-items:center; justify-content:center;
      cursor:pointer;
    }
    .icon-btn:hover{ background: var(--p-surface-100); }
    .icon-btn img{ display:block; }
  `],
})
export class OrderCardComponent implements OnInit, OnDestroy, OnChanges {
  @Input() order!: Order;

  @Output() deliver = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  /** Estado visual “nuevo” */
  @Input() isNew: boolean = false;
  /** Notifica que se vio (para quitar resaltado) */
  @Output() seen = new EventEmitter<string>();

  /** ===== Tiempo transcurrido (solo en preparación) ===== */
  startedAt: Date | null = null;
  elapsedMinutesLabel = '—';
  showElapsed = false;

  private timer: any;

  /** Label "Mesa 5" si existe número de mesa; si no, null */
  get tableLabel(): string | null {
    const num =
      (this.order as any)?.table ??
      (this.order as any)?.mesa ??
      (this.order as any)?.tableNumber ??
      (this.order as any)?.tableNo ??
      null;

    if (num === null || num === undefined) return null;
    const s = `${num}`.trim();
    return s ? `Mesa ${s}` : null;
  }

  ngOnInit(): void {
    const createdAt = (this.order as any)?.createdAt as string | undefined;
    this.startedAt = createdAt ? new Date(createdAt) : null;
    this.updateTickerState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['order']) {
      const createdAt = (this.order as any)?.createdAt as string | undefined;
      this.startedAt = createdAt ? new Date(createdAt) : null;
      this.updateTickerState();
    }
  }

  ngOnDestroy(): void { this.clearTimer(); }

  private updateTickerState(): void {
    this.showElapsed = this.order?.status === 'EN_PREPARACION';
    if (this.showElapsed) {
      this.updateElapsed();
      this.clearTimer();
      this.timer = setInterval(() => this.updateElapsed(), 60_000);
    } else {
      this.clearTimer();
      this.elapsedMinutesLabel = '—';
    }
  }

  private clearTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  onEditClick(ev: Event){
    ev.stopPropagation();
    this.edit.emit(this.order?.id);
  }

  private updateElapsed(): void {
    if (!this.startedAt || isNaN(this.startedAt.getTime())) {
      this.elapsedMinutesLabel = '—';
      return;
    }
    const diffMs = Date.now() - this.startedAt.getTime();
    const mins = Math.max(0, Math.floor(diffMs / 60000));
    this.elapsedMinutesLabel = `${mins} min`;
  }
}
