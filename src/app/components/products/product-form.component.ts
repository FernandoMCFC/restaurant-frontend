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
            <div class="p-inputgroup">
              <span class="p-inputgroup-addon currency-addon">BOB</span>
              <p-inputnumber
                inputId="price"
                formControlName="price"
                [mode]="'decimal'"
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

          <!-- Categorías -->
          <div class="field col-12">
            <label for="categories" class="text-600 text-sm block mb-2">Categorías</label>
            <p-multiselect
              inputId="categories"
              formControlName="categoryIds"
              [options]="categoryOptions"
              optionLabel="label"
              optionValue="value"
              [filter]="true"
              [showClear]="true"
              [showToggleAll]="false"
              appendTo="body"
              placeholder="Selecciona categorías"
              class="w-full">
            </p-multiselect>
            <small class="text-500">Puedes elegir varias categorías.</small>
          </div>

          <!-- Disponible -->
          <div class="field col-12 md:col-6">
            <label for="available" class="text-600 text-sm block mb-2">Disponible</label>
            <p-togglebutton
              inputId="available"
              formControlName="available"
              onLabel="Sí"
              offLabel="No"
              onIcon="pi pi-check"
              offIcon="pi pi-times"
              class="w-10rem"
              ariaLabel="Disponible">
            </p-togglebutton>
          </div>

          <!-- Visible para clientes -->
          <div class="field col-12 md:col-6">
            <label for="visible" class="text-600 text-sm block mb-2">Visible para clientes</label>
            <p-togglebutton
              inputId="visible"
              formControlName="visibleForClients"
              onLabel="Sí"
              offLabel="No"
              onIcon="pi pi-eye"
              offIcon="pi pi-eye-slash"
              class="w-14rem"
              ariaLabel="Visible para clientes">
            </p-togglebutton>
          </div>

          <!-- Descripción -->
          <div class="field col-12">
            <label for="description" class="text-600 text-sm block mb-2">Descripción</label>
            <textarea
              id="description"
              pTextarea
              rows="3"
              formControlName="description"
              placeholder="Detalles del producto..."
              class="w-full">
            </textarea>
          </div>

          <!-- Imágenes -->
          <div class="field col-12">
            <label class="text-600 text-sm block mb-2">Fotos</label>
            <p-fileupload
              name="photos[]"
              mode="advanced"
              [multiple]="true"
              accept="image/*"
              [auto]="false"
              [customUpload]="true"
              (onSelect)="onSelect($event)"
              (uploadHandler)="onUpload($event)"
              (onClear)="onClear()"
              chooseLabel="Elegir"
              uploadLabel="Subir"
              cancelLabel="Cancelar">
            </p-fileupload>

            <!-- Preview grande + lightbox -->
            <div class="preview-large" *ngIf="activePreview">
              <p-image [src]="activePreview" alt="Vista previa" [preview]="true" imageStyleClass="preview-large-img"></p-image>
              <small class="text-500 block mt-1">Haz clic en la imagen para verla a pantalla completa.</small>
            </div>

            <!-- Miniaturas -->
            <div class="preview-list mt-3" *ngIf="preview.length">
              <img
                *ngFor="let src of preview; let i = index"
                [src]="src"
                alt="foto"
                [class.active]="src === activePreview"
                (click)="activePreview = src"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="actions">
        <button pButton type="button" [text]="true" (click)="onReset()">Limpiar</button>
        <button pButton type="submit" class="save-btn" [disabled]="form.invalid">Guardar</button>
      </div>
    </form>
  `,
  styles: [`
    :host{ display:block; }
    .product-form{ background:transparent; border:none; box-shadow:none; padding:0; display:flex; flex-direction:column; min-height:0; }
    .form-scroll{ flex:1 1 auto; min-height:0; overflow-y:auto; overflow-x:hidden; max-height:calc(100vh - 220px); }
    .formgrid, .field, .p-inputtext, .p-inputnumber, .p-multiselect, .p-inputtextarea, .p-fileupload { min-width:0; }

    .currency-addon{ padding: 0 .85rem; min-width: 3rem; text-align: center; }

    /* Preview grande */
    .preview-large{ margin-top:.75rem; }
    .preview-large-img{ max-width: 460px; width:100%; height:auto; border-radius:12px; border:1px solid var(--p-surface-300); display:block; }

    /* Miniaturas */
    .preview-list{ display:flex; flex-wrap:wrap; gap:.6rem; }
    .preview-list img{
      width:110px; height:110px; object-fit:cover;
      border-radius:.75rem; border:1px solid var(--p-surface-300);
      cursor:pointer; transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
    }
    .preview-list img:hover{ transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,.08); }
    .preview-list img.active{ outline:2px solid var(--p-primary-400); border-color: var(--p-primary-300); }

    .actions{ flex:0 0 auto; display:flex; justify-content:end; gap:.5rem; margin-top:.75rem; }
    .error{ color: var(--p-red-500); font-size:.78rem; }
    .p-togglebutton .p-button{ border-radius:.625rem; }
    .p-multiselect{ border-radius:.625rem; }
    .p-inputtextarea{ resize:vertical; }
    .save-btn{ background:var(--p-primary-500); border-color:var(--p-primary-500); color:#fff; }
    .save-btn:hover{ filter:brightness(.98); }
    @media (max-width:768px){
      .form-scroll{ max-height:calc(100vh - 200px); }
      .preview-large-img{ max-width:100%; }
      .preview-list img{ width:96px; height:96px; }
    }
  `]
})
export class ProductFormComponent {
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
        const res = String(reader.result || '');
        acc.push(res);
        this.preview = [...acc];
        this.activePreview = this.activePreview ?? acc[0]; // muestra grande la primera seleccionada
        this.form.patchValue({ photos: [...acc] });
      };
      reader.readAsDataURL(f);
    });
  }

  onUpload(_ev: any){ /* subir al backend si aplica */ }

  onClear(){
    this.preview = [];
    this.activePreview = null;
    this.form.patchValue({ photos: [] });
  }

  onReset(){
    this.minFrac = 0;
    this.preview = [];
    this.activePreview = null;
    this.form.reset({
      name: '',
      price: null,
      description: '',
      categoryIds: [],
      available: true,
      visibleForClients: true,
      photos: []
    });
  }

  onSubmit(){
    if (this.form.invalid) return;

    const { name, price, description, categoryIds, available, visibleForClients, photos } = this.form.value;
    const normalizedPrice = price != null ? Math.round(Number(price) * 100) / 100 : 0;
    const categoryId = (categoryIds && categoryIds.length) ? categoryIds[0] : '';

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
