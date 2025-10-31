// src/app/components/categories/category-add-dialog.component.ts
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
      <div class="field">
        <label>Nombre</label>
        <input pInputText formControlName="name" placeholder="Ej. Bebidas" />
        <small class="hint" *ngIf="form.controls['name'].touched && form.controls['name'].invalid">
          El nombre es requerido.
        </small>
      </div>

      <div class="field switch-field">
        <label>Visibilidad</label>
        <p-checkbox formControlName="visible" [binary]="true" inputId="vis" label="Visible"></p-checkbox>
      </div>

      <div class="actions">
        <button pButton type="button" label="Cancelar" class="p-button-text" (click)="close.emit()"></button>
        <button pButton type="submit" [label]="isEdit ? 'Guardar cambios' : 'Agregar'" [disabled]="form.invalid"></button>
      </div>
    </form>
  `,
  styles: [`
    :host{ display:block; }
    .form-grid{
      display:grid; grid-template-columns: 1fr 200px; gap: .75rem 1rem; align-items:end;
      padding-top:.25rem;
    }
    .field{ display:flex; flex-direction:column; gap:.25rem; }
    .switch-field{ align-items:flex-start; }
    .hint{ color: var(--p-orange-500); }
    .actions{
      grid-column: 1 / -1; display:flex; justify-content:flex-end; gap:.5rem; padding-top:.5rem;
    }
    @media (max-width: 640px){
      .form-grid{ grid-template-columns: 1fr; }
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
