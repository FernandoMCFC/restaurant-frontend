import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
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
import { ImageModule } from 'primeng/image';

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
    NgIf,
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
      <div class="form-body">
        <div class="formgrid grid">
          <!-- Nombre -->
          <div class="field col-12 md:col-6">
            <label for="name" class="label">Nombre</label>
            <input
              id="name"
              pInputText
              formControlName="name"
              placeholder="Ej. Bife de chorizo"
              class="w-full"
            />
            <small class="error" *ngIf="form.touched && nameCtrl?.invalid">
              Obligatorio (máx. 120)
            </small>
          </div>

          <!-- Precio -->
          <div class="field col-12 md:col-6">
            <label for="price" class="label">Precio</label>
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
            <small class="error" *ngIf="form.touched && priceCtrl?.invalid">
              Ingresa un precio válido
            </small>
          </div>

          <!-- Categoria -->
          <div class="field field-category col-12 md:col-6">
            <label class="label">Categoría</label>
            <p-multiselect
              display="chip"
              [options]="categoryOptions"
              formControlName="categoryIds"
              placeholder="Selecciona categorías"
              [filter]="true"
              filterPlaceHolder="Buscar categoría..."
              [maxSelectedLabels]="2"
              selectedItemsLabel="{0} categorías seleccionadas"
              allSelectedLabel="Todas las categorías seleccionadas"
              emptyFilterMessage="No se encontraron categorías"
              emptyMessage="No hay categorías disponibles"
              [showToggleAll]="false">
            </p-multiselect>
          </div>

          <!-- Disponible / Visible -->
          <div class="field field-toggle col-6 md:col-3">
            <label class="label">Disponible</label>
            <div class="toggle-wrapper">
              <p-toggleButton
                formControlName="available"
                onLabel="Sí"
                offLabel="No"
                onIcon="pi pi-check"
                offIcon="pi pi-times">
              </p-toggleButton>
            </div>
          </div>

          <div class="field field-toggle col-6 md:col-3">
            <label class="label">Visible</label>
            <div class="toggle-wrapper">
              <p-toggleButton
                formControlName="visibleForClients"
                onLabel="Sí"
                offLabel="No"
                onIcon="pi pi-eye"
                offIcon="pi pi-eye-slash">
              </p-toggleButton>
            </div>
          </div>

          <!-- Descripcion -->
          <div class="field col-12">
            <label class="label">Descripción</label>
            <textarea
              pTextarea
              formControlName="description"
              rows="4"
              placeholder="Detalles del producto..."
              class="desc-textarea">
            </textarea>
          </div>

          <!-- Fotos -->
          <div class="field col-12">
            <label class="label">Fotos</label>

            <div class="photos-box">
              <p-fileUpload
                name="photos[]"
                mode="basic"
                [auto]="false"
                [multiple]="false"
                (onSelect)="onSelect($event)"
                chooseLabel="Seleccionar imágenes"
                chooseIcon="pi pi-upload"
                accept="image/jpeg,image/png,image/webp,.webp"
                [maxFileSize]="2097152"
                styleClass="photos-upload-root"
                chooseStyleClass="upload-choose-btn action-btn">
              </p-fileUpload>

              <div class="previews" *ngIf="preview">
                <div class="preview-card single">
                  <p-image
                    [src]="preview.src"
                    alt="Foto del producto"
                    [preview]="true"
                    imageClass="prev-img">
                  </p-image>

                  <div class="preview-actions">
                    <button
                      type="button"
                      pButton
                      icon="pi pi-trash"
                      label="Eliminar"
                      class="p-button-danger p-button-text preview-remove-btn"
                      (click)="removePhoto()">
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <small class="photos-help">
              Formatos permitidos: JPG, JPEG y PNG. Tamaño máximo 2&nbsp;MB por imagen.
            </small>
          </div>
        </div>
      </div>

      <div class="actions">
        <button
          pButton
          type="submit"
          label="Guardar"
          icon="pi pi-save"
          class="p-button action-btn"
          pRipple>
        </button>
        <button
          pButton
          type="button"
          label="Limpiar"
          icon="pi pi-eraser"
          class="p-button p-button-secondary action-btn"
          (click)="onReset()"
          pRipple>
        </button>
      </div>
    </form>
  `,
  styles: [`
    :host{
      display:block;
      max-width:100%;
    }

    .product-form{
      display:flex;
      flex-direction:column;
      gap:1.1rem;
      max-width:100%;
      box-sizing:border-box;
    }

    .form-body{
      padding: 1.1rem 1.5rem .4rem;
      box-sizing:border-box;
      max-width:100%;
      overflow-x:hidden;
    }

    .field{
      margin-bottom:.75rem;
      min-width:0;
    }

    .label{
      display:block;
      margin-bottom:.6rem;
      font-size:.86rem;
      font-weight:600;
      color: var(--p-text-muted-color);
    }

    .error{
      color: var(--p-red-600);
      font-size:.78rem;
      margin-top:.18rem;
      display:block;
    }

    .field-category,
    .field-toggle{
      display:flex;
      flex-direction:column;
      justify-content:flex-start;
    }

    .field-category :is(.p-multiselect){
      margin-top:.1rem;
      width:100%;
      display:flex;
      align-items:center;
      box-sizing:border-box;
    }

    .field-toggle .toggle-wrapper{
      margin-top:.1rem;
      width:100%;
      display:flex;
      align-items:center;
      box-sizing:border-box;
    }

    .toggle-wrapper{
      padding:.18rem .22rem;
      border-radius:.7rem;
      background: color-mix(in oklab, var(--p-surface-100) 70%, var(--p-surface-0));
    }

    .actions{
      margin-top:.25rem;
      padding: .7rem 1.5rem .15rem;
      border-top:1px solid var(--p-surface-200);
      display:flex;
      gap:.7rem;
      justify-content:flex-end;
      box-sizing:border-box;
    }

    .action-btn{
      min-height: 2.5rem;
      padding-inline: 1.2rem;
      font-size:.9rem;
      font-weight:600;
      border-radius: 999px;
    }

    :host ::ng-deep .product-form .p-inputtext,
    :host ::ng-deep .product-form .p-inputnumber input,
    :host ::ng-deep .product-form textarea.p-inputtextarea{
      padding: .55rem .75rem;
      border-radius:.6rem;
      width:100%;
      box-sizing:border-box;
    }

    .desc-textarea{
      width:100%;
      max-width:100%;
    }

    :host ::ng-deep .product-form .p-multiselect{
      width:100%;
    }

    :host ::ng-deep .product-form .p-multiselect-label{
      padding: .48rem .7rem;
    }

    :host ::ng-deep .product-form .p-togglebutton{
      width:100%;
      justify-content: center;
      min-height: 2.5rem;
    }

    :host ::ng-deep .product-form .p-togglebutton .p-button-label{
      padding-inline:.4rem;
    }

    :host ::ng-deep .product-form .action-btn .p-button-label{
      padding-inline: .9rem;
    }

    /* ---------- MultiSelect ---------- */
    :host ::ng-deep .product-form .p-multiselect-header{
      padding-block:.35rem .4rem;
    }

    :host ::ng-deep .product-form .p-multiselect-filter-container{
      position:relative;
    }

    :host ::ng-deep .product-form .p-multiselect-filter-icon{
      position:absolute;
      right:.5rem;
      top:50%;
      transform:translateY(-50%);
      margin-top:0;
      line-height:1;
    }

    :host ::ng-deep .product-form .p-multiselect-filter-container .p-inputtext{
      padding-right:2rem;
    }

    /* ---------- Fotos ---------- */
    .photos-box{
      margin-top:.2rem;
      padding:.8rem .9rem .7rem;
      border-radius:1rem;
      border:1px dashed var(--p-surface-300);
      background: color-mix(in oklab, var(--p-surface-0) 80%, var(--p-surface-100));
      display:flex;
      flex-direction:column;
      gap:.6rem;
    }

    .photos-help{
      margin-top:.35rem;
      font-size:.75rem;
      color: var(--p-text-muted-color);
    }

    :host ::ng-deep .product-form .photos-upload-root{
      width:100%;
    }

    :host ::ng-deep .product-form .upload-choose-btn{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      min-height:2.5rem;
      padding-inline:1.2rem;
      border-radius:999px;
      font-size:.9rem;
      font-weight:600;
      gap:.4rem;
    }

    :host ::ng-deep .product-form .upload-choose-btn .p-button-icon-left{
      margin-right:.35rem;
    }

    .previews{
      margin-top:.2rem;
    }

    .preview-card.single{
      width:160px;
      display:flex;
      flex-direction:column;
      align-items:center;
      gap:.35rem;
    }

    .prev-img{
      width:160px;
      height:120px;
      object-fit:cover;
      border-radius:.9rem;
      border:1px solid var(--p-surface-200);
    }

    .preview-actions{
      width:100%;
      display:flex;
      justify-content:center;
    }

    .preview-remove-btn{
      min-height:2rem;
      padding-inline:.9rem;
      border-radius:999px;
      font-size:.8rem;
      font-weight:600;
    }

    @media (max-width: 768px){
      .form-body{
        padding-inline: 1.1rem;
      }
      .actions{
        padding-inline: 1.1rem;
      }
    }
  `]
})
export class ProductFormComponent {
  @Input() model?: Product;
  @Input() categories: ProductCategory[] = [];
  @Output() save = new EventEmitter<Omit<Product,'id'>>();

  minFrac = 0;

  get categoryOptions() {
    return (this.categories || []).map(c => ({ label: c.name, value: c.id }));
  }

  get nameCtrl() {
    return this.form.get('name');
  }

  get priceCtrl() {
    return this.form.get('price');
  }

  preview: { name: string; src: string } | null = null;
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

      if (Array.isArray(m.photos) && m.photos.length > 0) {
        this.preview = { name: 'Foto del producto', src: m.photos[0] };
      } else {
        this.preview = null;
      }
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

  onSelect(event: any){
    const raw = event?.files ?? event?.currentFiles ?? [];
    const files: File[] = Array.isArray(raw) ? raw : Array.from(raw as FileList);

    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result);
      this.preview = { name: file.name, src: base64 };
      this.form.patchValue({ photos: [base64] }, { emitEvent:false });
    };
    reader.readAsDataURL(file);
  }

  removePhoto(){
    this.preview = null;
    this.form.patchValue({ photos: [] }, { emitEvent:false });
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
    this.preview = null;
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
