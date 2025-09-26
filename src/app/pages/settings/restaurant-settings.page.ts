import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  selector: 'app-restaurant-settings-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    CheckboxModule,
    ButtonModule
  ],
  template: `
    <div class="settings-container" [formGroup]="form">
      
      <!-- HEADER -->
      <div class="header">
        <h1>Configuración del Restaurante</h1>
        <p>Completa los datos de tu empresa</p>
      </div>

      <!-- DATOS DE LA EMPRESA -->
      <p-card class="card">
        <div class="card-header">
          <i class="pi pi-building"></i>
          <h2>Datos de la Empresa</h2>
        </div>

        <div class="vertical-fields">
          <div class="field">
            <label for="nombre">Nombre del Restaurante *</label>
            <input
              pInputText
              id="nombre"
              formControlName="nombre"
              placeholder="Ej. Brasa Brava"
              class="input-field"
              [ngClass]="{ invalid: isInvalid('nombre') }" />
            <small class="error" *ngIf="isInvalid('nombre')">Nombre requerido</small>
          </div>

          <div class="field">
            <label for="telefono">Teléfono</label>
            <input
              pInputText
              id="telefono"
              formControlName="telefono"
              placeholder="+591 XXX XXX XXX"
              class="input-field" />
          </div>

          <div class="field">
            <label for="descripcion">Descripción</label>
            <textarea
              pTextarea
              id="descripcion"
              rows="3"
              autoResize
              formControlName="descripcion"
              placeholder="Breve descripción del restaurante..."
              class="input-field"></textarea>
          </div>
        </div>
      </p-card>

      <!-- INFORMACIÓN DE CONTACTO -->
      <p-card class="card">
        <div class="card-header">
          <i class="pi pi-envelope"></i>
          <h2>Información de Contacto</h2>
        </div>

        <div class="vertical-fields">
          <div class="field">
            <label for="web">Sitio Web</label>
            <input
              pInputText
              id="web"
              formControlName="web"
              placeholder="https://turestaurante.com"
              class="input-field" />
          </div>

          <div class="field">
            <label for="email">Email *</label>
            <input
              pInputText
              id="email"
              formControlName="email"
              placeholder="contacto@turestaurante.com"
              class="input-field"
              [ngClass]="{ invalid: isInvalid('email') }" />
            <small class="error" *ngIf="isInvalid('email')">Email no válido</small>
          </div>
        </div>
      </p-card>

      <!-- UBICACIÓN -->
      <p-card class="card">
        <div class="card-header">
          <i class="pi pi-map-marker"></i>
          <h2>Ubicación</h2>
        </div>

        <div class="grid-fields">
          <div class="field">
            <label for="calle">Dirección</label>
            <input
              pInputText
              id="calle"
              formControlName="calle"
              placeholder="Av. Principal #1234"
              class="input-field" />
          </div>

          <div class="field">
            <label for="ciudad">Ciudad</label>
            <input
              pInputText
              id="ciudad"
              formControlName="ciudad"
              placeholder="Cochabamba"
              class="input-field" />
          </div>

          <div class="field">
            <label for="pais">País</label>
            <input
              pInputText
              id="pais"
              formControlName="pais"
              placeholder="Bolivia"
              class="input-field" />
          </div>
        </div>
      </p-card>

      <!-- MÉTODOS DE PAGO -->
      <p-card class="card">
        <div class="card-header">
          <i class="pi pi-credit-card"></i>
          <h2>Métodos de Pago</h2>
        </div>

        <div class="inline-fields">
          <div class="checkbox-field">
            <p-checkbox
              inputId="efectivo"
              [binary]="true"
              formControlName="efectivo"
              class="checkbox">
            </p-checkbox>
            <label for="efectivo">Efectivo</label>
          </div>
          
          <div class="checkbox-field">
            <p-checkbox
              inputId="credito"
              [binary]="true"
              formControlName="credito"
              class="checkbox">
            </p-checkbox>
            <label for="credito">Tarjeta de Crédito</label>
          </div>
        </div>
      </p-card>

      <!-- BOTÓN GUARDAR Y MENSAJE -->
      <div class="actions-container">
        <div class="actions-content">
          <!-- MENSAJE DE CONFIRMACIÓN -->
          <div *ngIf="showSuccessMessage" class="success-message">
            <div class="message-content">
              <i class="pi pi-check-circle"></i>
              <span>Cambios guardados exitosamente</span>
              <button class="close-btn" (click)="showSuccessMessage = false">
                <i class="pi pi-times"></i>
              </button>
            </div>
            <div class="progress-bar" [class.hidden]="!showProgressBar">
              <div class="progress-fill" [style.width.%]="progressWidth"></div>
            </div>
          </div>

          <!-- BOTÓN GUARDAR -->
          <button
            pButton
            type="button"
            class="save-button"
            [disabled]="isSaving"
            (click)="onSubmit()">
            <i class="pi pi-check" *ngIf="!isSaving"></i>
            <i class="pi pi-spinner pi-spin" *ngIf="isSaving"></i>
            {{ isSaving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host{
      display:block;
      background: linear-gradient(135deg, var(--p-surface-50, #f8fafc) 0%, var(--p-surface-100, #f1f5f9) 100%);
      min-height:100vh;
      padding:30px 20px;
    }

    .settings-container{
        width: 100%;
        max-width: none;   
        margin: 0;        
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    /* .settings-container{ max-width:600px; margin:0 auto; display:flex; flex-direction:column; gap:24px; } */

    .header{ text-align:center; margin-bottom:10px; }
    .header h1{ margin:0 0 8px; font-size:28px; color:var(--p-emphasis-high, #1e293b); font-weight:700; }
    .header p{ margin:0; color:var(--p-text-muted-color, #64748b); font-size:16px; }

    .card{
      background:var(--p-surface-0,#fff);
      border-radius:12px;
      box-shadow:0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -1px rgba(0,0,0,.06);
      border:1px solid var(--p-surface-200,#e2e8f0);
      transition:transform .2s, box-shadow .2s;
    }
    .card:hover{
      transform:translateY(-2px);
      box-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05);
    }

    :host ::ng-deep .p-card{ box-shadow:none; border:none; }
    :host ::ng-deep .p-card .p-card-body{ padding:24px; }
    :host ::ng-deep .p-card .p-card-content{ padding:0; }

    .card-header{
      display:flex; align-items:center; gap:12px;
      margin-bottom:24px; padding-bottom:16px; border-bottom:2px solid var(--p-surface-100,#f1f5f9);
    }
    .card-header h2{ margin:0; font-size:20px; color:var(--p-emphasis-high,#1e293b); font-weight:600; }
    .card-header i{ color:var(--p-primary-500,#6366f1); font-size:20px; }

    .vertical-fields{ display:flex; flex-direction:column; gap:20px; }
    .grid-fields{ display:grid; gap:20px; }
    @media (min-width:768px){ .grid-fields{ grid-template-columns:1fr 1fr; } }

    .inline-fields{ display:flex; gap:40px; flex-wrap:wrap; }

    .field{ display:flex; flex-direction:column; }
    label{ font-weight:600; font-size:14px; margin-bottom:8px; color:var(--p-emphasis-medium,#374151); }

    .input-field{
      width:100%; padding:12px 16px;
      border:2px solid var(--p-surface-300,#e5e7eb);
      border-radius:8px; font-size:15px; transition:all .3s ease; background:var(--p-surface-0,#fff); font-family:inherit;
    }
    .input-field:hover{ border-color:var(--p-surface-400,#d1d5db); }
    .input-field:focus{
      outline:none;
      border-color:var(--p-primary-500,#6366f1);
      box-shadow:0 0 0 3px color-mix(in oklab, var(--p-primary-500,#6366f1) 20%, transparent);
      transform:translateY(-1px);
    }
    .input-field.invalid{
      border-color:var(--p-red-500,#ef4444);
      box-shadow:0 0 0 3px color-mix(in oklab, var(--p-red-500,#ef4444) 20%, transparent);
    }
    .input-field::placeholder{ color:var(--p-text-muted-color,#9ca3af); }
    textarea.input-field{ resize:vertical; min-height:100px; line-height:1.5; }

    .error{ color:var(--p-red-500,#ef4444); font-size:13px; margin-top:6px; font-weight:500; }

    .checkbox-field{ display:flex; align-items:center; gap:10px; padding:8px 0; }
    .checkbox-field label{ margin:0; font-weight:500; cursor:pointer; color:var(--p-emphasis-medium,#374151); font-size:15px; }

    :host ::ng-deep .p-checkbox .p-checkbox-box{
      border:2px solid var(--p-surface-400,#d1d5db);
      border-radius:4px;
    }
    :host ::ng-deep .p-checkbox .p-checkbox-box.p-highlight{
      background:var(--p-primary-500,#6366f1);
      border-color:var(--p-primary-500,#6366f1);
    }

    /* CONTENEDOR DE ACCIONES + MENSAJE */
    .actions-container{ margin-top:20px; }
    .actions-content{ display:flex; flex-direction:column; gap:16px; align-items:center; }
    @media (min-width:768px){ .actions-content{ flex-direction:row; justify-content:center; gap:20px; } }

    .success-message{
      background: linear-gradient(135deg, var(--p-green-500,#10b981) 0%, color-mix(in oklab, var(--p-green-600,#059669) 100%, transparent));
      color:white; padding:12px 16px; border-radius:10px;
      box-shadow:0 4px 12px color-mix(in oklab, var(--p-green-600,#059669) 30%, transparent);
      animation: slideInRight .3s ease-out; min-width:280px; position:relative; overflow:hidden;
    }
    @keyframes slideInRight{ from{ opacity:0; transform:translateX(20px);} to{opacity:1; transform:translateX(0);} }
    .message-content{ display:flex; align-items:center; gap:10px; font-weight:500; }
    .message-content i.pi-check-circle{ font-size:18px; color: color-mix(in oklab, white 80%, var(--p-green-500,#10b981)); }
    .close-btn{ background:none; border:none; color:white; cursor:pointer; padding:4px; border-radius:4px; margin-left:auto; transition:background .2s; }
    .close-btn:hover{ background: rgba(255,255,255,.12); }
    .close-btn i{ font-size:14px; }

    .progress-bar{ position:absolute; bottom:0; left:0; width:100%; height:3px; background: rgba(255,255,255,.3); border-radius:0 0 10px 10px; overflow:hidden; }
    .progress-fill{ height:100%; background: color-mix(in oklab, white 75%, var(--p-green-500,#10b981)); transition:width .1s linear; border-radius:0 0 10px 10px; }
    .hidden{ display:none; }

    /* BOTÓN con los colores del tema */
    .save-button{
      background: linear-gradient(135deg, var(--p-primary-500,#6366f1) 0%, var(--p-primary-600,#4f46e5) 100%);
      border:none; padding:12px 32px; border-radius:10px; color:white;
      font-weight:600; font-size:15px; cursor:pointer; transition:all .3s ease;
      box-shadow:0 4px 12px color-mix(in oklab, var(--p-primary-600,#4f46e5) 30%, transparent);
      display:flex; align-items:center; gap:8px; min-width:120px; justify-content:center;
    }
    .save-button:hover:not(:disabled){
      transform:translateY(-2px);
      box-shadow:0 6px 20px color-mix(in oklab, var(--p-primary-600,#4f46e5) 40%, transparent);
    }
    .save-button:active{ transform:translateY(0); }
    .save-button:disabled{ opacity:.7; cursor:not-allowed; transform:none; }

    :host ::ng-deep .p-inputtext{ width:100%; font-family:inherit; }
  `]
})
export class RestaurantSettingsPage {
  private fb = inject(FormBuilder);

  showSuccessMessage = false;
  showProgressBar = false;
  progressWidth = 100;
  isSaving = false;

  form = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    telefono: [''],
    web: [''],
    email: ['', Validators.email],
    calle: [''],
    ciudad: [''],
    pais: ['Bolivia'],
    efectivo: [true],
    credito: [false],
  });

  isInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    // Simula llamado al backend
    await new Promise(r => setTimeout(r, 1500));

    this.isSaving = false;
    this.showSuccessMessage = true;
    this.showProgressBar = true;
    this.progressWidth = 100;

    const t = setInterval(() => {
      this.progressWidth -= 1;
      if (this.progressWidth <= 0) {
        clearInterval(t);
        this.showSuccessMessage = false;
        this.showProgressBar = false;
      }
    }, 50);
  }
}
