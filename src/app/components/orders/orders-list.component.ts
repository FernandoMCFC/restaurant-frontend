import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { SelectButtonModule } from 'primeng/selectbutton';
import { OrdersStore } from '../../pages/orders/orders.store';
import { OrderCardComponent } from './order-card.component';

type GroupKey = 'PREPARACION' | 'ENTREGADO' | 'CANCELADO';

interface FilterOption {
  label: string;
  value: GroupKey;
  icon: string;
}

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,            // <- necesario para [(ngModel)]
    ButtonModule,
    RippleModule,
    SelectButtonModule,
    OrderCardComponent
  ],
  template: `
    <section class="orders">
      <header class="header">
        <div class="title-row">
          <h1>Pedidos</h1>

          <!-- Filtros: SelectButton múltiple (PrimeNG 20) -->
          <p-selectbutton
            [options]="filterOptions"
            [multiple]="true"
            [(ngModel)]="selectedGroupsModel"
            (onChange)="onFilterChange($event.value)"
            optionLabel="label"
            optionValue="value"
            class="state-filters">
            <ng-template pTemplate="item" let-opt>
              <div class="opt">
                <i [class]="opt.icon"></i>
                <span>{{ opt.label }}</span>
                <span class="count" *ngIf="getCount(opt.value) !== undefined">
                  ({{ getCount(opt.value) }})
                </span>
              </div>
            </ng-template>
          </p-selectbutton>
        </div>

        <!-- Botón + circular -->
        <button
          pButton
          icon="pi pi-plus"
          class="add-btn p-button-rounded p-button-icon-only"
          aria-label="Nuevo pedido"
          (click)="goNew()">
        </button>
      </header>

      <div class="grid-list">
        <app-order-card
          *ngFor="let o of filtered(); let i = index; trackBy: trackById"
          [order]="o"
          [isNew]="store.isNew(o.id)"
          (seen)="store.markSeen($event)"
          (deliver)="onDeliver($event)"
          (cancel)="onCancel($event)"
          (edit)="onEdit($event)"
          [ngClass]="['card-variant', 'v' + ((i % 3) + 1)]">
        </app-order-card>
      </div>
    </section>
  `,
  styles: [`
    .orders{ padding:16px; }

    /* ======= ESCRITORIO (igual que tenías) ======= */
    .header{
      display:flex; align-items:center; justify-content:space-between;
      margin-bottom:12px;
      gap:12px;
      flex-wrap:wrap;
    }
    .title-row{
      display:flex; align-items:center; gap:12px; flex-wrap:wrap;
    }
    h1{ margin:0; font-size:22px; font-weight:700; color:var(--p-emphasis-high); }

    /* SelectButton segmentado (desktop) */
    :host ::ng-deep p-selectbutton.state-filters .p-selectbutton{
      display:inline-flex; gap:0;
      border-radius:999px; overflow:hidden;
      box-shadow: inset 0 0 0 1px var(--p-surface-300);
      background: var(--p-surface-0);
      max-width:100%;
    }
    :host ::ng-deep p-selectbutton.state-filters .p-button{
      border:0; border-radius:0;
      background:transparent; color:var(--p-text-color);
      padding:0.35rem 0.9rem;
      white-space: nowrap;
      flex: 0 0 auto;
    }
    :host ::ng-deep p-selectbutton.state-filters .p-button + .p-button{
      border-left: 1px solid var(--p-surface-300);
    }
    :host ::ng-deep p-selectbutton.state-filters .p-button.p-highlight{
      background:var(--p-primary-color);
      color:var(--p-primary-contrast-color);
      font-weight:700;
    }
    :host ::ng-deep p-selectbutton.state-filters .p-button:not(.p-highlight):hover{
      background:var(--p-surface-100);
    }
    .opt{ display:flex; align-items:center; gap:.45rem; }
    .opt .count{ opacity:.85; font-weight:600; }

    /* Botón + */
    .add-btn.p-button{
      width:46px; height:46px; border-radius:9999px; padding:0;
      display:inline-flex; align-items:center; justify-content:center;
    }
    .add-btn .p-button-icon{ margin:0 !important; }

    /* Grilla de tarjetas */
    .grid-list{ display:grid; gap:16px; grid-template-columns: repeat(1, minmax(0,1fr)); }
    @media (min-width: 640px){ .grid-list{ grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1200px){ .grid-list{ grid-template-columns: repeat(3, 1fr); } }

    /* ======= SOLO MÓVIL (≤ 640px) – sin tocar escritorio ======= */
    @media (max-width: 639.98px){
      .header{
        display:grid;
        grid-template-columns: 1fr auto;
        grid-template-rows: auto auto;
        align-items:center;
        row-gap:8px;
      }
      .title-row{
        grid-column: 1 / -1;
        display:grid;
        grid-template-columns: 1fr;
        gap:8px;
      }
      .title-row h1{ grid-row: 1; }
      .title-row p-selectbutton.state-filters{
        grid-row: 2;
        max-width:100%;
      }
      .add-btn{ grid-column: 2; grid-row: 1; justify-self:end; }

      :host ::ng-deep p-selectbutton.state-filters .p-selectbutton{
        display:flex; flex-wrap:wrap; gap:8px;
        box-shadow:none; background:transparent; border-radius:0;
        overflow:visible;
      }
      :host ::ng-deep p-selectbutton.state-filters .p-button{
        border-radius:999px;
        border:1px solid var(--p-surface-300);
        background: var(--p-surface-0);
        padding: 0.35rem 0.8rem;
      }
      :host ::ng-deep p-selectbutton.state-filters .p-button + .p-button{
        border-left:none;
      }
      :host ::ng-deep p-selectbutton.state-filters .p-button.p-highlight{
        background: var(--p-primary-50, rgba(0,0,0,.03));
        color: var(--p-primary-color);
        border-color: var(--p-primary-300, var(--p-primary-color));
      }
    }

    /* ============================================================
       Variantes visuales por tarjeta (solo estilos, no lógica)
       ============================================================ */
    /* v1 */
    :host ::ng-deep app-order-card.card-variant.v1 .order-card{
      --card-bg: color-mix(in srgb, var(--p-primary-50, #f1ecff) 28%, var(--p-surface-0));
      --card-accent: color-mix(in srgb, var(--p-primary-color) 55%, transparent);
      --card-border: color-mix(in srgb, var(--p-primary-200, #d6ccff) 46%, var(--p-surface-200));
    }
    /* v2 */
    :host ::ng-deep app-order-card.card-variant.v2 .order-card{
      --card-bg: color-mix(in srgb, var(--p-primary-50, #f1ecff) 20%, var(--p-surface-0));
      --card-accent: color-mix(in srgb, var(--p-primary-color) 40%, transparent);
      --card-border: color-mix(in srgb, var(--p-primary-200, #d6ccff) 32%, var(--p-surface-200));
    }
    /* v3 */
    :host ::ng-deep app-order-card.card-variant.v3 .order-card{
      --card-bg: color-mix(in srgb, var(--p-primary-50, #f1ecff) 14%, var(--p-surface-0));
      --card-accent: color-mix(in srgb, var(--p-primary-color) 28%, transparent);
      --card-border: color-mix(in srgb, var(--p-primary-200, #d6ccff) 22%, var(--p-surface-200));
    }

    /* Los pedidos NUEVOS mantienen su fondo ámbar; solo reforzamos borde/acento */
    :host ::ng-deep app-order-card.card-variant .order-card.is-new{
      --card-accent: color-mix(in srgb, var(--p-primary-color) 35%, transparent);
      --card-border: color-mix(in srgb, #fde68a 60%, var(--p-surface-200));
    }
  `]
})
export class OrdersListComponent {
  constructor(public store: OrdersStore, private router: Router) {}

  // Pedidos desde el store
  readonly orders = computed(() => this.store.orders());

  // Opciones del filtro
  readonly filterOptions: FilterOption[] = [
    { label: 'En preparación', value: 'PREPARACION', icon: 'pi pi-clock' },
    { label: 'Entregados',     value: 'ENTREGADO',   icon: 'pi pi-check-circle' },
    { label: 'Cancelados',     value: 'CANCELADO',   icon: 'pi pi-times-circle' },
  ];

  // Modelo de selección (ngModel) + signal fuente
  private readonly selectedGroups = signal<GroupKey[]>(['PREPARACION','ENTREGADO','CANCELADO']);
  selectedGroupsModel: GroupKey[] = this.selectedGroups();

  private toGroup(status: unknown): GroupKey {
    const s = (String(status ?? '')).toUpperCase()
      .normalize('NFD').replace(/\p{Diacritic}/gu, '');
    if (/(CANCEL|ANUL)/.test(s)) return 'CANCELADO';
    if (/(ENTREG|DELIVER|LISTO|COMPLET|FINALIZ)/.test(s)) return 'ENTREGADO';
    return 'PREPARACION';
  }

  private readonly countsMap = computed<Record<GroupKey, number>>(() => {
    const c: Record<GroupKey, number> = { PREPARACION: 0, ENTREGADO: 0, CANCELADO: 0 };
    for (const o of this.orders()) c[this.toGroup((o as any).status)]++;
    return c;
  });
  getCount(g: GroupKey){ return this.countsMap()[g] ?? 0; }

  readonly filtered = computed(() => {
    const active = new Set(this.selectedGroups());
    if (active.size === 0) return [];
    return this.orders().filter(o => active.has(this.toGroup((o as any).status)));
  });

  onFilterChange(selected: GroupKey[] | undefined){
    this.selectedGroups.set([...(selected ?? [])]);
  }

  onDeliver(id: string){ this.store.setDelivered(id); }
  onCancel(id: string){ this.store.cancel(id); }

  onEdit(id: string){ this.router.navigateByUrl(`/orders/new?edit=${id}&openCart=1`); }

  goNew(){ this.router.navigateByUrl('/orders/new'); }
  trackById = (_: number, x: any) => x?.id;
}
