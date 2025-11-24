import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoriesStore } from '../../pages/categories/categories.store';

/* PrimeNG v20 */
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-category-add-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, CheckboxModule, ButtonModule],
  template: `
    <form [formGroup]="form" class="form-grid" (ngSubmit)="submit()">
      <!-- Nombre -->
      <div class="field">
        <label class="label">Nombre</label>
        <input
          pInputText
          formControlName="name"
          placeholder="Ej. Bebidas"
          class="w-full"
        />
        <small class="hint" *ngIf="form.controls['name'].touched && form.controls['name'].invalid">
          El nombre es requerido.
        </small>
      </div>

      <!-- Visibilidad -->
      <div class="field switch-field">
        <label class="label">Visibilidad</label>
        <p-checkbox
          formControlName="visible"
          [binary]="true"
          inputId="vis"
          label="Visible">
        </p-checkbox>
      </div>

      <!-- Botones -->
      <div class="actions">
        <button
          pButton
          type="button"
          label="Cancelar"
          class="p-button-text btn-secondary"
          (click)="close.emit()">
        </button>

        <button
          pButton
          type="submit"
          class="btn-primary"
          [label]="isEdit ? 'Guardar cambios' : 'Agregar'"
          [disabled]="form.invalid">
        </button>
      </div>
    </form>
  `,
  styles: [`
    :host{
      display:block;
    }

    .form-grid{
      display:grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 220px);
      column-gap: 1.2rem;
      row-gap: .8rem;
      align-items:flex-end;
      padding: .6rem 1.4rem .9rem;
      box-sizing:border-box;
    }

    .field{
      display:flex;
      flex-direction:column;
      gap:.25rem;
      min-width:0;
    }

    .label{
      font-size:.88rem;
      font-weight:600;
      color: var(--p-text-color);
    }

    .switch-field{
      align-items:flex-start;
    }

    .hint{
      color: var(--p-orange-500);
      font-size:.78rem;
      margin-top:.1rem;
    }

    .actions{
      grid-column: 1 / -1;
      display:flex;
      justify-content:flex-end;
      gap:.6rem;
      padding-top:.8rem;
    }

    :host ::ng-deep .form-grid .p-inputtext{
      padding:.5rem .7rem;
      border-radius:.55rem;
      width:100%;
      box-sizing:border-box;
    }

    /* Botones pill */
    :host ::ng-deep .btn-primary{
      min-height:2.5rem;
      padding-inline:1.4rem;
      border-radius:999px;
      font-size:.9rem;
      font-weight:600;
    }

    :host ::ng-deep .btn-primary .p-button-label{
      padding-inline:.8rem;
    }

    :host ::ng-deep .btn-secondary{
      min-height:2.5rem;
      padding-inline:1.1rem;
      border-radius:999px;
      font-size:.9rem;
      font-weight:600;
    }

    @media (max-width: 640px){
      .form-grid{
        grid-template-columns: 1fr;
        padding-inline:1rem;
      }
      .actions{
        flex-wrap:wrap;
      }
    }
  `]
})
export class CategoryAddDialogComponent implements OnChanges {

  @Input() editId: string | null = null;
  @Output() close = new EventEmitter<void>();

  form!: FormGroup;
  isEdit = false;

  constructor(private fb: FormBuilder, private store: CategoriesStore) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      visible: [true],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isEdit = !!this.editId;

    if (this.isEdit && this.editId) {
      const cat = this.store.getById(this.editId);
      if (cat) {
        this.form.reset({ name: cat.name, visible: cat.visible });
        return;
      }
    }

    this.form.reset({ name: '', visible: true });
  }

  submit(){
    if (this.form.invalid) return;
    const { name, visible } = this.form.getRawValue();

    if (this.isEdit && this.editId) {
      this.store.updateBasic(this.editId, { name: String(name), visible: !!visible });
    } else {
      this.store.add(String(name), !!visible);
    }

    this.close.emit();
  }
}
