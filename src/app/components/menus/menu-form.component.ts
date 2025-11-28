// src/app/components/menus/menu-form.component.ts
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

/* PrimeNG v20 */
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

import type { Menu } from '../../pages/menus/menus.types';
import type {
  Product,
  ProductCategory,
} from '../../pages/products/products.types';

@Component({
  selector: 'app-menu-form',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    NgIf,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    ButtonModule,
    RippleModule,
  ],
  template: `
    <form class="menu-form p-fluid" [formGroup]="form" (ngSubmit)="onSubmit()">
      <!-- CUERPO SCROLLEABLE -->
      <div class="form-body">
        <div class="formgrid grid">
          <!-- Nombre -->
          <div class="field col-12 md:col-7">
            <label for="name" class="label">
              Nombre del menú
              <span class="req">*</span>
            </label>
            <input
              id="name"
              pInputText
              formControlName="name"
              placeholder="Ej. Menú del día"
              class="w-full form-input"
              autocomplete="off"
            />
            <small
              class="error"
              *ngIf="
                form.controls.name.invalid &&
                (form.controls.name.dirty || form.controls.name.touched)
              "
            >
              El nombre es obligatorio.
            </small>
          </div>

          <!-- Fecha -->
          <div class="field col-12 md:col-5">
            <label for="date" class="label">
              Fecha del menú
              <span class="req">*</span>
            </label>
            <p-datepicker
              inputId="date"
              formControlName="date"
              [showIcon]="true"
              [showOnFocus]="false"
              dateFormat="dd/mm/yy"
              panelStyleClass="menu-datepicker-panel"
              [inputStyleClass]="'form-input'"
              class="w-full"
            ></p-datepicker>
            <small
              class="error"
              *ngIf="
                form.controls.date.invalid &&
                (form.controls.date.dirty || form.controls.date.touched)
              "
            >
              La fecha es obligatoria.
            </small>
          </div>

          <!-- Descripción -->
          <div class="field col-12">
            <label for="description" class="label">Descripción</label>
            <textarea
              id="description"
              rows="3"
              pTextarea
              formControlName="description"
              class="w-full desc-textarea form-input"
              autocomplete="off"
              placeholder="Opcional: breve descripción del menú"
            ></textarea>
          </div>

          <!-- Selección de categoría -->
          <div class="field col-12">
            <label for="categoryBrowserId" class="label">Categoría</label>
            <p-select
              inputId="categoryBrowserId"
              formControlName="categoryBrowserId"
              [options]="categoryOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecciona una categoría"
              class="w-full category-select"
              panelStyleClass="category-select-panel"
            ></p-select>
            <small class="hint">
              Elige una categoría para ver sus productos y marcarlos con un
              check.
            </small>
          </div>

          <!-- Productos de la categoría seleccionada -->
          <div class="field col-12" *ngIf="currentCategoryProducts().length">
            <label class="label">Productos de la categoría seleccionada</label>
            <div class="products-list">
              <div
                class="product-item"
                *ngFor="let prod of currentCategoryProducts()"
              >
                <input
                  type="checkbox"
                  [checked]="isProductSelected(prod.id)"
                  (change)="toggleProduct(prod.id, $event.target.checked)"
                />
                <span class="product-name">{{ prod.name }}</span>
              </div>
            </div>
          </div>

          <!-- Mensaje cuando la categoría no tiene productos -->
          <div
            class="field col-12"
            *ngIf="
              !currentCategoryProducts().length &&
              form.get('categoryBrowserId')?.value
            "
          >
            <span class="muted">Esta categoría no tiene productos.</span>
          </div>

          <!-- Resumen de productos seleccionados -->
          <div class="field col-12" *ngIf="selectedProducts().length">
            <label class="label">Productos seleccionados</label>
            <div class="chips">
              <span class="chip" *ngFor="let prod of selectedProducts()">
                {{ prod.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER FIJO -->
      <div class="actions">
        <button
          type="button"
          pButton
          pRipple
          class="p-button p-button-secondary action-btn"
          label="Cancelar"
          (click)="onCancelClick()"
        ></button>

        <button
          type="submit"
          pButton
          pRipple
          class="p-button action-btn"
          label="Guardar"
          [disabled]="form.invalid"
        ></button>
      </div>
    </form>
  `,
  styles: [
    `
      :host {
        display: block;
        max-width: 100%;
      }

      .menu-form {
        display: flex;
        flex-direction: column;
        gap: 1.1rem;
        max-width: 100%;
        box-sizing: border-box;
        height: 100%;
      }

      .form-body {
        flex: 1 1 auto;
        min-height: 0;
        padding: 1.1rem 1.5rem 0.4rem;
        box-sizing: border-box;
        max-width: 100%;
        overflow-x: hidden;
        overflow-y: auto;
      }

      .formgrid {
        row-gap: 0.9rem;
      }

      .field {
        min-width: 0;
      }

      .menu-form .label {
        display: block;
        margin-bottom: 0.55rem;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--p-text-muted-color);
      }

      .req {
        color: var(--p-red-600);
        margin-left: 0.18rem;
      }

      .error {
        color: var(--p-red-600);
        font-size: 0.8rem;
        margin-top: 0.18rem;
        display: block;
      }

      .hint {
        font-size: 0.8rem;
        color: var(--p-text-muted-color);
        margin-top: 0.2rem;
      }

      .muted {
        font-size: 0.86rem;
        color: var(--p-text-muted-color);
      }

      /* === Productos === */
      .products-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 0.45rem;
        padding: 0.35rem 0;
      }

      .product-item {
        display: flex;
        align-items: flex-start;
        gap: 0.4rem;
        font-size: 0.86rem;
        padding: 0.35rem 0.45rem;
        border-radius: 0.55rem;
        background: var(--p-surface-0);
        border: 1px solid var(--p-surface-200);
        box-sizing: border-box;
        transition:
          border-color 0.12s ease,
          box-shadow 0.12s ease,
          transform 0.08s ease;
      }

      .product-item:hover {
        border-color: var(--p-primary-200);
        box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
        transform: translateY(-1px);
      }

      .product-item input[type='checkbox'] {
        width: 1.05rem;
        height: 1.05rem;
        margin-top: 0.15rem;
        border-radius: 0.3rem;
        border: 1px solid var(--p-surface-400);
        accent-color: var(--p-primary-color);
        cursor: pointer;
      }

      .product-name {
        flex: 1;
        word-break: break-word;
        line-height: 1.25;
        color: var(--p-text-color);
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
      }

      .chip {
        background: var(--p-surface-100);
        border-radius: 999px;
        padding: 0.2rem 0.6rem;
        font-size: 0.8rem;
      }

      /* Footer fijo */
      .actions {
        flex: 0 0 auto;
        margin-top: 0.25rem;
        padding: 0.7rem 1.5rem 0.2rem;
        border-top: 1px solid var(--p-surface-200);
        display: flex;
        gap: 0.7rem;
        justify-content: flex-end;
        box-sizing: border-box;
        background: var(--p-surface-0);
      }

      .action-btn {
        min-height: 2.6rem;
        padding-inline: 1.3rem;
        font-size: 0.92rem;
        font-weight: 600;
        border-radius: 999px;
      }

      .desc-textarea {
        width: 100%;
        max-width: 100%;
      }

      /* === Inputs / textareas: borde visible === */
      .menu-form .form-input {
        padding: 0.55rem 0.75rem;
        border-radius: 0.6rem;
        width: 100%;
        box-sizing: border-box;
        border: 1px solid var(--p-surface-300) !important;
        background: var(--p-surface-50) !important;
        transition:
          border-color 0.15s ease,
          background-color 0.15s ease,
          box-shadow 0.15s ease;
      }

      .menu-form .form-input:focus {
        outline: none;
        background: #ffffff !important;
        border-color: var(--p-primary-color) !important;
        box-shadow: 0 0 0 1px var(--p-primary-color);
      }

      /* === Select categoría === */
      .menu-form .category-select {
        border-radius: 0.6rem;
        border: 1px solid var(--p-surface-300);
        background: var(--p-surface-0);
      }

      .menu-form .category-select .p-select-label {
        padding: 0.55rem 0.75rem;
        font-size: 0.9rem;
      }

      .menu-form
        .category-select
        .p-select-label.p-placeholder {
        color: var(--p-text-muted-color);
      }

      .menu-form .category-select .p-select-trigger {
        border-left: 1px solid var(--p-surface-200);
      }

      .menu-form
        .category-select.p-focus,
      .menu-form
        .category-select.p-inputwrapper-focus {
        border-color: var(--p-primary-color);
        box-shadow: 0 0 0 1px var(--p-primary-color);
        background: #ffffff;
      }

      /* Panel de opciones del select */
      :host
        ::ng-deep
        .category-select-panel {
        border-radius: 0.75rem !important;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.18) !important;
        padding-block: 0.25rem;
      }

      :host
        ::ng-deep
        .category-select-panel
        .p-select-option {
        padding: 0.45rem 0.75rem;
        font-size: 0.9rem;
        border-radius: 0.45rem;
        margin-inline: 0.25rem;
      }

      :host
        ::ng-deep
        .category-select-panel
        .p-select-option:hover {
        background: var(--p-surface-100);
      }

      :host
        ::ng-deep
        .category-select-panel
        .p-select-option.p-highlight {
        background: var(--p-primary-50);
        color: var(--p-primary-color);
      }

      /* Datepicker panel */
      .menu-datepicker-panel {
        transform: scale(0.9);
        transform-origin: top left;
        border: 1px solid var(--p-surface-200);
        border-radius: 0.75rem;
        box-shadow: 0 8px 20px rgba(15, 23, 42, 0.18);
        overflow: hidden;
      }

      .menu-datepicker-panel .p-datepicker-calendar {
        font-size: 0.8rem;
      }

      /* ✅ SOLO CAMBIO DE COLOR DEL BOTÓN CANCELAR */
      .menu-form .p-button.p-button-secondary {
        background: #6b7280 !important;
        border-color: #6b7280 !important;
        color: #ffffff !important;
      }

      .menu-form .p-button.p-button-secondary:hover {
        background: #4b5563 !important;
        border-color: #4b5563 !important;
      }

      @media (max-width: 768px) {
        .form-body {
          padding-inline: 1.1rem;
        }

        .actions {
          padding-inline: 1.1rem;
        }
      }
    `,
  ],
})
export class MenuFormComponent implements OnChanges {
  @Input() model?: Menu;
  @Input() categories: ProductCategory[] = [];
  @Input() products: Product[] = [];

  @Output() save = new EventEmitter<Omit<Menu, 'id'>>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  /** Opciones para el select de categorías */
  get categoryOptions() {
    return (this.categories ?? []).map(c => ({
      label: c.name,
      value: c.id,
    }));
  }

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: [''],
    date: [null as Date | null, [Validators.required]],
    categoryBrowserId: ['' as string | null],
    productIds: [[] as string[]],
  });

  currentCategoryProducts(): Product[] {
    const catId = this.form.get('categoryBrowserId')?.value;
    if (!catId) return [];
    return (this.products ?? []).filter(p => p.categoryId === catId);
  }

  selectedProducts(): Product[] {
    const ids = new Set(this.form.get('productIds')?.value ?? []);
    if (!ids.size) return [];
    return (this.products ?? []).filter(p => ids.has(p.id));
  }

  isProductSelected(productId: string): boolean {
    const ids: string[] = this.form.get('productIds')?.value ?? [];
    return ids.includes(productId);
  }

  toggleProduct(productId: string, checked: boolean) {
    const ctrl = this.form.get('productIds');
    const ids: string[] = ctrl?.value ?? [];
    const set = new Set(ids);
    if (checked) set.add(productId);
    else set.delete(productId);
    ctrl?.setValue(Array.from(set));
    ctrl?.markAsDirty();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['model']) {
      const m = this.model;
      if (m) {
        this.form.reset({
          name: m.name ?? '',
          description: m.description ?? '',
          date: this.parseDate(m.date),
          categoryBrowserId: m.categoryIds?.[0] ?? null,
          productIds: m.productIds ?? [],
        });
      } else {
        this.form.reset({
          name: '',
          description: '',
          date: null,
          categoryBrowserId: null,
          productIds: [],
        });
      }
    }
  }

  private parseDate(value?: string): Date | null {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  private buildCategoryIdsFromProducts(productIds: string[]): string[] {
    const set = new Set<string>();
    const all = this.products ?? [];
    for (const pid of productIds) {
      const prod = all.find(p => p.id === pid);
      if (prod?.categoryId) set.add(prod.categoryId);
    }
    return Array.from(set);
  }

  private normalizeDate(value: Date | null): string {
    if (!value || isNaN(value.getTime())) return '';
    return value.toISOString().slice(0, 10);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, description, date, productIds } = this.form.value;
    const prodIds = productIds ?? [];
    const categoryIds = this.buildCategoryIdsFromProducts(prodIds);
    const normalizedDate = this.normalizeDate(date as Date | null);

    this.save.emit({
      name: (name ?? '').trim(),
      description: (description ?? '').trim(),
      date: normalizedDate,
      categoryIds,
      productIds: prodIds,
    });
  }

  onCancelClick() {
    this.cancel.emit();
  }
}
