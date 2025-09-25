import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  Validators,
  NonNullableFormBuilder,
  FormGroup
} from '@angular/forms';

import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';

import { SettingsService } from '../services/settings.service';

@Component({
  standalone: true,
  selector: 'app-restaurant-settings-page',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    DividerModule,
    ButtonModule,
    ToggleSwitchModule,
    InputTextModule,
    TextareaModule,
    MessageModule
  ],
  template: `
    <div class="grid">
      <div class="col-12 lg:col-10 lg:col-offset-1">
        <div class="mb-3">
          <h2 class="m-0">Configuración del restaurante</h2>
          <p class="text-color-secondary m-0">
            Parametriza la información principal del restaurante.
          </p>
        </div>

        <!-- Métodos de pago -->
        <p-card header="Métodos de pago" class="mb-3">
          <div class="flex align-items-center justify-content-between border-1 surface-border border-round p-3 mb-2">
            <div>
              <div class="font-medium">Efectivo</div>
              <small class="text-color-secondary">Permite cobrar en efectivo</small>
            </div>
            <p-toggleSwitch [(ngModel)]="cash"></p-toggleSwitch>
          </div>

          <div class="flex align-items-center justify-content-between border-1 surface-border border-round p-3">
            <div>
              <div class="font-medium">Crédito</div>
              <small class="text-color-secondary">Registra pagos con tarjeta/crédito</small>
            </div>
            <p-toggleSwitch [(ngModel)]="credit"></p-toggleSwitch>
          </div>

          <div class="mt-3">
            <button pButton label="Guardar métodos de pago" icon="pi pi-save" (click)="savePayments()"></button>
          </div>
        </p-card>

        <!-- Datos de la empresa -->
        <p-card header="Datos de la empresa" class="mb-3">
          <form [formGroup]="companyForm" (ngSubmit)="saveCompany()" class="grid">
            <div class="col-12">
              <label for="name" class="block mb-1">Nombre *</label>
              <input pInputText id="name" formControlName="name" class="w-full" />
              <small class="text-red-500"
                     *ngIf="companyForm.get('name')?.touched && companyForm.get('name')?.invalid">
                Requerido
              </small>
            </div>

            <div class="col-12">
              <label for="description" class="block mb-1">Descripción</label>
              <textarea pTextarea id="description" formControlName="description" rows="3" class="w-full"></textarea>
            </div>

            <div class="col-12 md:col-6">
              <label for="phone" class="block mb-1">Teléfono</label>
              <input pInputText id="phone" formControlName="phone" class="w-full" />
            </div>

            <div class="col-12 md:col-6">
              <label for="website" class="block mb-1">Página web</label>
              <input pInputText id="website" formControlName="website" placeholder="https://..." class="w-full" />
              <small class="text-red-500"
                     *ngIf="companyForm.get('website')?.touched && companyForm.get('website')?.invalid">
                URL inválida
              </small>
            </div>

            <div class="col-12 md:col-6">
              <label for="email" class="block mb-1">Email</label>
              <input pInputText id="email" formControlName="email" class="w-full" />
              <small class="text-red-500"
                     *ngIf="companyForm.get('email')?.touched && companyForm.get('email')?.invalid">
                Email inválido
              </small>
            </div>

            <div class="col-12 mt-2">
              <button pButton type="submit" label="Guardar empresa" icon="pi pi-save"
                      [disabled]="companyForm.invalid"></button>
            </div>
          </form>
        </p-card>

        <!-- Ubicación -->
        <p-card header="Ubicación">
          <form [formGroup]="locationForm" (ngSubmit)="saveLocation()" class="grid">
            <div class="col-12">
              <label for="street" class="block mb-1">Calle</label>
              <input pInputText id="street" formControlName="street" class="w-full" />
            </div>

            <div class="col-12 md:col-6">
              <label for="city" class="block mb-1">Ciudad</label>
              <input pInputText id="city" formControlName="city" class="w-full" />
            </div>

            <div class="col-12 md:col-6">
              <label for="country" class="block mb-1">País</label>
              <input pInputText id="country" formControlName="country" class="w-full" />
            </div>

            <div class="col-12 mt-2">
              <button pButton type="submit" label="Guardar ubicación" icon="pi pi-save"></button>
            </div>
          </form>
        </p-card>
      </div>
    </div>
  `
})
export class RestaurantSettingsPage implements OnInit {
  // toggles
  cash = true;
  credit = true;

  companyForm!: FormGroup;
  locationForm!: FormGroup;

  constructor(
    private fb: NonNullableFormBuilder,
    private settings: SettingsService
  ) {
    // Inicialización en el constructor
    this.companyForm = this.fb.group({
      name: this.fb.control('', [Validators.required]),
      description: this.fb.control(''),
      phone: this.fb.control(''),
      website: this.fb.control('', [Validators.pattern(/^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/i)]),
      email: this.fb.control('', [Validators.email])
    });

    this.locationForm = this.fb.group({
      street: this.fb.control(''),
      city: this.fb.control(''),
      country: this.fb.control('')
    });
  }

  ngOnInit(): void {
    const p = this.settings.loadPayments();
    this.cash = p.cash;
    this.credit = p.credit;

    this.companyForm.patchValue(this.settings.loadCompany());
    this.locationForm.patchValue(this.settings.loadLocation());
  }

  savePayments() {
    this.settings.savePayments({ cash: this.cash, credit: this.credit });
  }

  saveCompany() {
    if (this.companyForm.valid) {
      this.settings.saveCompany(this.companyForm.getRawValue() as any);
    } else {
      this.companyForm.markAllAsTouched();
    }
  }

  saveLocation() {
    this.settings.saveLocation(this.locationForm.getRawValue() as any);
  }
}
