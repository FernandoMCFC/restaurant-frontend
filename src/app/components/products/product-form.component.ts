import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

/* PrimeNG v20 (módulos seguros) */
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

export interface ProductCategory { id: string; name: string; }
export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  photos?: string[];
  available: boolean;
  visibleForClients: boolean;
  categoryId?: string;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    SelectButtonModule,
    ButtonModule,
    RippleModule
  ],
  template: `
    <form class="product-form p-fluid" [formGroup]="form" (ngSubmit)="onSubmit()">

      <div class="formgrid grid">
        <!-- Nombre -->
        <div class="field col-12 md:col-6">
          <label for="name" class="text-600 text-sm block mb-2">Nombre</label>
          <input id="name" pInputText formControlName="name" placeholder="Ej. Bife de chorizo" class="w-full" />
        </div>

        <!-- Precio -->
        <div class="field col-12 md:col-6">
          <label for="price" class="text-600 text-sm block mb-2">Precio</label>
          <input id="price" pInputText type="number" min="0" step="0.01" formControlName="price" class="w-full" placeholder="Ej. 49.90" />
        </div>

        <!-- Descripción -->
        <div class="field col-12">
          <label for="description" class="text-600 text-sm block mb-2">Descripción</label>
          <textarea id="description" pInputText rows="3" formControlName="description" class="w-full" placeholder="Descripción corta..."></textarea>
        </div>

        <!-- Categoría -->
        <div class="field col-12">
          <label class="text-600 text-sm block mb-2">Categoría</label>
          <p-selectButton
            formControlName="categoryId"
            [options]="categoryOptions"
            optionLabel="label"
            optionValue="value"
            [multiple]="false"
            [unselectable]="true"
            class="w-full flex flex-wrap gap-2">
          </p-selectButton>
          <small class="text-500">Elige una categoría</small>
        </div>

        <!-- Disponible -->
        <div class="field col-12 md:col-6">
          <label class="text-600 text-sm block mb-2">Disponible</label>
          <p-selectButton
            formControlName="available"
            [options]="booleanOptions"
            optionLabel="label"
            optionValue="value"
            [multiple]="false"
            [unselectable]="true">
          </p-selectButton>
        </div>

        <!-- Visible para clientes -->
        <div class="field col-12 md:col-6">
          <label class="text-600 text-sm block mb-2">Visible para clientes</label>
          <p-selectButton
            formControlName="visibleForClients"
            [options]="booleanOptions"
            optionLabel="label"
            optionValue="value"
            [multiple]="false"
            [unselectable]="true">
          </p-selectButton>
        </div>

        <!-- Fotos (nativo) -->
        <div class="field col-12">
          <label for="photos" class="text-600 text-sm block mb-2">Fotos</label>
          <input id="photos" type="file" multiple accept="image/*" (change)="onNativeFiles($event)" />
          <div class="preview-list mt-3">
            <img *ngFor="let src of preview" [src]="src" alt="foto">
          </div>
        </div>

        <!-- Botones -->
        <div class="col-12 flex justify-content-end gap-2 mt-2">
          <button pButton type="button" label="Limpiar" class="p-button-outlined" (click)="onReset()"></button>
          <button pButton type="submit" label="Guardar" [disabled]="form.invalid"></button>
        </div>
      </div>

    </form>
  `,
  styles: [`
    /* Ajustes visuales finos para alinear con tu UI */
    .product-form .p-selectbutton .p-button { padding: .5rem .75rem; }
    .preview-list { display:flex; flex-wrap:wrap; gap:.5rem; }
    .preview-list img {
      width: 92px; height: 92px; object-fit: cover;
      border-radius: .75rem; border:1px solid var(--surface-300);
    }
    textarea[pinputtext] { resize: vertical; }
  `]
})
export class ProductFormComponent {
  @Input() categories: ProductCategory[] = [];
  @Output() save = new EventEmitter<Omit<Product,'id'>>();

  booleanOptions = [
    { label: 'Sí', value: true },
    { label: 'No', value: false }
  ];

  get categoryOptions() {
    return (this.categories || []).map(c => ({ label: c.name, value: c.id }));
  }

  preview: string[] = [];

  private fb = new FormBuilder();
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    price: [0,   [Validators.required, Validators.min(0)]],
    description: [''],
    categoryId: [''],
    available: [true],
    visibleForClients: [true],
    photos: [[] as string[]]
  });

  onNativeFiles(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    const readers = files.map(f => new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = rej;
      r.readAsDataURL(f);
    }));

    Promise.all(readers).then(imgs => {
      const current = this.form.value.photos || [];
      const merged = [...current, ...imgs];
      this.form.patchValue({ photos: merged });
      this.preview = merged;
    });
  }

  onReset(){
    this.form.reset({
      name: '',
      price: 0,
      description: '',
      categoryId: '',
      available: true,
      visibleForClients: true,
      photos: []
    });
    this.preview = [];
  }

  onSubmit(){
    if (this.form.invalid) return;
    const { name, price, description, categoryId, available, visibleForClients, photos } = this.form.value;
    this.save.emit({
      name: name!,
      price: Number(price!),
      description: description ?? '',
      categoryId: categoryId || undefined,
      available: !!available,
      visibleForClients: !!visibleForClients,
      photos: photos ?? []
    });
    this.onReset();
  }
}
