import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  Validators,
  ValidatorFn,
  AbstractControl
} from '@angular/forms';

/* PrimeNG 20: componentes standalone */
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';

import {
  RestaurantSettingsService,
  RestaurantSettings
} from '../../shared/restaurant-settings.service';

/** Validador: al menos un método de pago */
const atLeastOnePayment: ValidatorFn = (group: AbstractControl) => {
  const cash = group.get('cash')?.value;
  const credit = group.get('credit')?.value;
  return cash || credit ? null : { paymentRequired: true };
};

@Component({
  standalone: true,
  selector: 'app-restaurant-settings',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputText, Textarea, ToggleSwitch, Button, Divider
  ],
  template: `
    <div class="page">
      <h2>Configuracion del Restaurant</h2>
      <p class="hint">Completa la información básica del negocio y habilita los métodos de pago.</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">
        <!-- Métodos de pago -->
        <section class="card">
          <h3>Métodos de pago</h3>

          <div class="field-row">
            <label for="cash">Efectivo</label>
            <p-toggleSwitch inputId="cash" formControlName="cash"></p-toggleSwitch>
          </div>

          <div class="field-row">
            <label for="credit">Crédito</label>
            <p-toggleSwitch inputId="credit" formControlName="credit"></p-toggleSwitch>
          </div>

          <small class="error" *ngIf="hasPaymentError()">Habilita al menos un método de pago.</small>
        </section>

        <!-- Datos Empresa -->
        <section class="card">
          <h3>Datos de la Empresa</h3>

          <div class="field">
            <label for="name">Nombre *</label>
            <input pInputText id="name" formControlName="name" placeholder="Ej. Brasa Brava" />
            <small class="error" *ngIf="f.name.touched && f.name.invalid">Ingresa un nombre válido (2–80).</small>
          </div>

          <div class="field">
            <label for="description">Descripción</label>
            <p-textarea id="description" formControlName="description" rows="3" placeholder="Breve descripción"></p-textarea>
          </div>

          <div class="grid-2">
            <div class="field">
              <label for="phone">Teléfono</label>
              <input pInputText id="phone" formControlName="phone" placeholder="+591 7xx xxx xx" />
              <small class="error" *ngIf="f.phone.touched && f.phone.invalid">Teléfono inválido.</small>
            </div>

            <div class="field">
              <label for="email">Email</label>
              <input pInputText id="email" formControlName="email" placeholder="contacto@ejemplo.com" />
              <small class="error" *ngIf="f.email.touched && f.email.invalid">Email inválido.</small>
            </div>
          </div>

          <div class="field">
            <label for="website">Página web</label>
            <input pInputText id="website" formControlName="website" placeholder="https://…" />
            <small class="error" *ngIf="f.website.touched && f.website.invalid">URL inválida.</small>
          </div>
        </section>

        <!-- Ubicación -->
        <section class="card">
          <h3>Ubicación</h3>

          <div class="field">
            <label for="street">Calle *</label>
            <input pInputText id="street" formControlName="street" />
            <small class="error" *ngIf="f.street.touched && f.street.invalid">Requerido.</small>
          </div>

          <div class="grid-2">
            <div class="field">
              <label for="city">Ciudad *</label>
              <input pInputText id="city" formControlName="city" />
              <small class="error" *ngIf="f.city.touched && f.city.invalid">Requerido.</small>
            </div>

            <div class="field">
              <label for="country">País *</label>
              <input pInputText id="country" formControlName="country" />
              <small class="error" *ngIf="f.country.touched && f.country.invalid">Requerido.</small>
            </div>
          </div>
        </section>

        <p-divider></p-divider>

        <!-- Acciones -->
        <div class="actions">
          <p-button type="button" label="Cancelar" [text]="true" (onClick)="onReset()"></p-button>
          <p-button type="submit" label="Guardar" [disabled]="form.invalid || !form.dirty"></p-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page{ display:block; }
    h2{ margin:.25rem 0 .5rem; font-weight:800; }
    .hint{ color:var(--p-text-muted-color); margin:0 0 1rem; }

    .form-grid{ display:grid; gap:1rem; grid-template-columns:1fr; }
    @media (min-width: 992px){
      .form-grid{ grid-template-columns: repeat(3, 1fr); align-items:start; }
    }

    .card{
      background:var(--p-surface-0);
      border:1px solid var(--p-surface-300);
      border-radius:12px; padding:1rem;
    }
    .card h3{ margin:.25rem 0 1rem; font-weight:700; }

    .field{ display:flex; flex-direction:column; gap:.35rem; margin-bottom:.75rem; }
    .grid-2{ display:grid; gap:.75rem; grid-template-columns:1fr; }
    @media (min-width: 768px){ .grid-2{ grid-template-columns:1fr 1fr; } }

    .field-row{
      display:flex; align-items:center; justify-content:space-between;
      padding:.5rem .75rem; border-radius:.5rem; background:var(--p-surface-50); margin-bottom:.5rem;
    }
    .actions{ display:flex; gap:.5rem; justify-content:flex-end; }
    .error{ color: var(--p-red-500); font-size:.75rem; }
  `]
})
export class RestaurantSettingsPage {
  private fb = inject(NonNullableFormBuilder);
  private svc = inject(RestaurantSettingsService);

  form = this.fb.group({
    // Métodos de pago
    cash: true,
    credit: false,
    // Datos empresa
    name: this.fb.control('', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]),
    description: this.fb.control('', [Validators.maxLength(500)]),
    phone: this.fb.control('', [Validators.pattern(/^[0-9+()\-\\s]{6,}$/)]),
    website: this.fb.control('', [Validators.pattern(/^https?:\/\/.+$/)]),
    email: this.fb.control('', [Validators.email]),
    // Ubicación
    street: this.fb.control('', [Validators.required]),
    city: this.fb.control('', [Validators.required]),
    country: this.fb.control('', [Validators.required]),
  }, { validators: atLeastOnePayment });

  get f(){ return this.form.controls; }

  hasPaymentError(): boolean {
    const errors = this.form.errors as Record<string, unknown> | null;
    return !!(errors && errors['paymentRequired']);
  }

  ngOnInit(){
    const saved = this.svc.get();
    if (saved){
      this.form.patchValue({
        cash: saved.payments.cash,
        credit: saved.payments.credit,
        name: saved.company.name,
        description: saved.company.description ?? '',
        phone: saved.company.phone ?? '',
        website: saved.company.website ?? '',
        email: saved.company.email ?? '',
        street: saved.location.street,
        city: saved.location.city,
        country: saved.location.country
      }, { emitEvent:false });
      this.form.markAsPristine();
    }
  }

  onReset(){
    this.form.reset({
      cash: true,
      credit: false,
      name: '',
      description: '',
      phone: '',
      website: '',
      email: '',
      street: '',
      city: '',
      country: ''
    });
    this.form.markAsPristine();
  }

  onSubmit(){
    if (this.form.invalid){ this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const payload: RestaurantSettings = {
      payments: { cash: v.cash, credit: v.credit },
      company: {
        name: v.name,
        description: v.description || undefined,
        phone: v.phone || undefined,
        website: v.website || undefined,
        email: v.email || undefined
      },
      location: { street: v.street, city: v.city, country: v.country }
    };
    this.svc.save(payload);
    this.form.markAsPristine();
  }
}
