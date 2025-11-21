// src/app/components/products/product-form.component.ts
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

/* PrimeNG v20 */
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TextareaModule } from 'primeng/textarea';
import { FileUploadModule } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image'; // ⬅️ preview grande/lightbox

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
    InputNumberModule,
    MultiSelectModule,
    ToggleButtonModule,
    ButtonModule,
    RippleModule,
    TextareaModule,
    FileUploadModule,
    ImageModule
  ],
  template: `
    <form class="product-form p-fluid" [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="form-scroll">
        <div class="formgrid grid">
          <!-- Nombre -->
          <div class="field col-12 md:col-6">
            <label for="name" class="text-600 text-sm block mb-2">Nombre</label>
            <input id="name" pInputText formControlName="name" placeholder="Ej. Bife de chorizo" class="w-full" />
            <small class="error" *ngIf="form.touched && form.controls['name']?.invalid">Obligatorio (máx. 120)</small>
          </div>

          <!-- Precio -->
          <div class="field col-12 md:col-6">
            <label for="price" class="text-600 text-sm block mb-2">Precio</label>
            <div class="w-full">
              <p-inputnumber
                inputId="price"
                formControlName="price"
                [min]="0"
                [minFractionDigits]="minFrac"
                [maxFractionDigits]="2"
                [step]="0.01"
                [useGrouping]="true"
                [allowEmpty]="true"
                [locale]="'es-BO'"
                [format]="true"
                (onFocus)="onPriceFocus()"
                (onBlur)="onPriceBlur()"
                placeholder="00,00">
              </p-inputnumber>
            </div>
            <small class="error" *ngIf="form.touched && form.controls['price']?.invalid">Ingresa un precio válido</small>
          </div>

          <!-- Categorías - solo una para compatibilidad (se guarda categoryId) -->
          <div class="field col-12 md:col-6">
            <label class="text-600 text-sm block mb-2">Categoría</label>
            <p-multiselect
              display="chip"
              [options]="categoryOptions"
              formControlName="categoryIds"
              [selectionLimit]="1"
              placeholder="Selecciona una categoría">
            </p-multiselect>
          </div>

          <!-- Disponible / Visible -->
          <div class="field col-6 md:col-3">
            <label class="text-600 text-sm block mb-2">Disponible</label>
            <p-toggleButton formControlName="available" onLabel="Sí" offLabel="No" onIcon="pi pi-check" offIcon="pi pi-times"></p-toggleButton>
          </div>
          <div class="field col-6 md:col-3">
            <label class="text-600 text-sm block mb-2">Visible</label>
            <p-toggleButton formControlName="visibleForClients" onLabel="Sí" offLabel="No" onIcon="pi pi-eye" offIcon="pi pi-eye-slash"></p-toggleButton>
          </div>

          <!-- Descripción -->
          <div class="field col-12">
            <label class="text-600 text-sm block mb-2">Descripción</label>
            <textarea pTextarea formControlName="description" rows="4" placeholder="Detalles del producto..."></textarea>
          </div>

          <!-- Fotos (preview grande) -->
          <div class="field col-12">
            <label class="text-600 text-sm block mb-2">Fotos</label>
            <p-fileUpload name="photos[]" mode="basic" [auto]="false" [customUpload]="true" (uploadHandler)="onSelect($event)" chooseLabel="Seleccionar imágenes"></p-fileUpload>

            <div class="previews" *ngIf="preview.length">
              <p-image *ngFor="let src of preview" [src]="src" alt="Foto" [preview]="true" imageClass="prev-img" />
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button pButton type="submit" label="Guardar" icon="pi pi-save" class="p-button-sm" pRipple></button>
        <button pButton type="button" label="Limpiar" icon="pi pi-eraser" class="p-button-sm p-button-secondary" (click)="onReset()" pRipple></button>
      </div>
    </form>
  `,
  styles: [`
    :host{ display:block; }
    .product-form{ display:flex; flex-direction:column; gap:.75rem; }
    .form-scroll{ max-height: calc(100dvh - 280px); overflow:auto; padding-right:.25rem; }

    .error{ color: var(--p-red-600); }

    .previews{ display:flex; gap:.5rem; flex-wrap:wrap; margin-top:.5rem; }
    .prev-img{ width:120px; height:120px; object-fit:cover; border-radius:.5rem; border:1px solid var(--p-surface-200); }

    .actions{ display:flex; gap:.5rem; justify-content:flex-end; }
  `]
})
export class ProductFormComponent {
  @Input() model?: Product;
  @Input() categories: ProductCategory[] = [];
  @Output() save = new EventEmitter<Omit<Product,'id'>>();

  // Decimales dinámicos: 0 al escribir, 2 al salir
  minFrac = 0;

  get categoryOptions() {
    return (this.categories || []).map(c => ({ label: c.name, value: c.id }));
  }

  preview: string[] = [];
  activePreview: string | null = null;

  private fb = new FormBuilder();

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    price: this.fb.control<number | null>(null, { validators: [Validators.required, Validators.min(0)] }),
    description: [''],
    categoryIds: [[] as string[]],
    available: [true],
    visibleForClients: [true],
    photos: [[] as string[]]
  });

  ngOnChanges(){
    const m = this.model;
    if (m){
      this.form.patchValue({
        name: m.name ?? '',
        price: m.price ?? null,
        description: m.description ?? '',
        categoryIds: m.categoryId ? [m.categoryId] : [],
        available: !!m.available,
        visibleForClients: !!m.visibleForClients,
        photos: m.photos ?? []
      }, { emitEvent:false });
      this.preview = Array.isArray(m.photos) ? [...m.photos] : [];
    }
  }

  onPriceFocus(){ this.minFrac = 0; }
  onPriceBlur(){
    const val = this.form.get('price')!.value;
    if (val != null) {
      const n = Math.round(Number(val) * 100) / 100;
      this.form.patchValue({ price: n }, { emitEvent: false });
    }
    this.minFrac = 2;
  }

  onSelect(ev: any){
    const files: File[] = (ev?.files as File[]) ?? [];
    this.preview = [];
    const acc: string[] = [];
    files.forEach((f: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = String(reader.result);
        acc.push(base64);
        this.preview = [...acc];
        const cur = this.form.get('photos')!.value || [];
        this.form.patchValue({ photos: [...cur, base64] }, { emitEvent:false });
      };
      reader.readAsDataURL(f);
    });
  }

  onReset(){
    this.form.reset({
      name: '',
      price: null,
      description: '',
      categoryIds: [],
      available: true,
      visibleForClients: true,
      photos: []
    });
    this.preview = [];
    this.activePreview = null;
  }

  onSubmit(){
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, price, description, categoryIds, available, visibleForClients, photos } = this.form.value;

    const normalizedPrice = typeof price === 'number'
      ? Math.round(price * 100) / 100
      : Number(price || 0);

    const categoryId = (categoryIds && categoryIds.length > 0) ? categoryIds[0] : undefined;

    this.save.emit({
      name: name!,
      price: normalizedPrice,
      description: (description || '').trim(),
      categoryId: categoryId || undefined,
      available: !!available,
      visibleForClients: !!visibleForClients,
      photos: photos ?? []
    });

    this.onReset();
  }
}
