import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CategoriesStore } from '../../pages/categories/categories.store';

/* PrimeNG v20 */
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-category-add-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ReactiveFormsModule,
    InputTextModule,
    CheckboxModule,
    ButtonModule,
  ],
  template: `
    <p-dialog
      [visible]="visible"
      (visibleChange)="onVisibleChange($event)"
      [modal]="true"
      [dismissableMask]="true"
      [draggable]="false"
      [resizable]="false"
      [closable]="false"
      [header]="isEdit ? 'Editar categoría' : 'Agregar categoría'"
      [style]="{ width: '520px', maxWidth: '96vw' }"
    >
      <!-- Header personalizado: título + X circular -->
      <ng-template pTemplate="header">
        <div class="dlg-header">
          <h2 class="dlg-title">
            {{ isEdit ? 'Editar categoría' : 'Agregar categoría' }}
          </h2>

          <button type="button" class="dlg-close" (click)="onVisibleChange(false)">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </ng-template>

      <!-- Contenido -->
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
          <small
            class="hint"
            *ngIf="
              form.controls['name'].touched &&
              form.controls['name'].invalid
            "
          >
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
            label="Visible"
          >
          </p-checkbox>
        </div>

        <!-- Botones -->
        <div class="actions">
          <button
            pButton
            type="button"
            label="Cancelar"
            class="p-button-text btn-secondary"
            (click)="onVisibleChange(false)"
          >
          </button>

          <button
            pButton
            type="submit"
            class="btn-primary"
            [label]="isEdit ? 'Guardar cambios' : 'Agregar'"
            [disabled]="form.invalid"
          >
          </button>
        </div>
      </form>
    </p-dialog>
  `,
  styles: [`
    :host{ display:block; }

    /* padding general del diálogo y botón X circular */
    :host ::ng-deep .p-dialog .p-dialog-header{
      padding:1rem 1.75rem .75rem;
    }
    :host ::ng-deep .p-dialog .p-dialog-header .p-dialog-header-content{
      width:100%;
    }
    :host ::ng-deep .p-dialog .p-dialog-content{
      padding:.75rem 1.75rem 1.5rem;
    }

    .dlg-header{
      display:flex;
      align-items:center;
      justify-content:space-between;
      width:100%;
      gap:1rem;
    }
    .dlg-title{
      margin:0;
      font-size:1.35rem;
      font-weight:700;
      color:var(--p-text-color);
    }
    .dlg-close{
      width:2.4rem;
      height:2.4rem;
      border-radius:999px;
      border:none;
      background:var(--p-primary-500);
      color:#fff;
      display:flex;
      align-items:center;
      justify-content:center;
      cursor:pointer;
      padding:0;
    }
    .dlg-close i{ font-size:1.1rem; }
    .dlg-close:hover{ filter:brightness(.96); }

    /* FORMULARIO */
    .form-grid{
      display:grid;
      grid-template-columns:minmax(0,1.4fr) minmax(0,220px);
      column-gap:1.2rem;
      row-gap:.8rem;
      align-items:flex-end;
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
      color:var(--p-text-color);
    }
    .switch-field{ align-items:flex-start; }

    .hint{
      color:var(--p-orange-500);
      font-size:.78rem;
      margin-top:.1rem;
    }

    .actions{
      grid-column:1 / -1;
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
    :host ::ng-deep .btn-primary,
    :host ::ng-deep .btn-secondary{
      min-height:2.5rem;
      border-radius:999px;
      font-size:.9rem;
      font-weight:600;
    }
    :host ::ng-deep .btn-primary{
      padding-inline:1.4rem;
    }
    :host ::ng-deep .btn-primary .p-button-label{
      padding-inline:.8rem;
    }
    :host ::ng-deep .btn-secondary{
      padding-inline:1.1rem;
    }

    @media (max-width:640px){
      .form-grid{
        grid-template-columns:1fr;
      }
      .actions{ flex-wrap:wrap; }
    }
  `]
})
export class CategoryAddDialogComponent implements OnChanges {

  @Input() editId: string | null = null;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

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

  onVisibleChange(v: boolean){
    this.visibleChange.emit(v);
  }

  submit(){
    if (this.form.invalid) return;
    const { name, visible } = this.form.getRawValue();

    if (this.isEdit && this.editId) {
      this.store.updateBasic(this.editId, { name: String(name), visible: !!visible });
    } else {
      this.store.add(String(name), !!visible);
    }

    this.onVisibleChange(false);
  }
}
