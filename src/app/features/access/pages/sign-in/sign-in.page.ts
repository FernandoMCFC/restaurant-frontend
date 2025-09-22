import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { SessionService } from '../../../../core/auth/services/session.service';

@Component({
  standalone: true,
  selector: 'app-sign-in',
  imports: [CommonModule, FormsModule, InputTextModule, PasswordModule, CheckboxModule, ButtonModule],
  template: `
    <h1>Iniciar Sesión</h1>

    <p class="sub">
      ¿No tienes una cuenta?
      <a href="#" class="text-violet-600 hover:underline">Contáctanos</a>
    </p>

    <form #f="ngForm" (ngSubmit)="onSubmit(f)" class="form" novalidate>
      <!-- Usuario -->
      <div class="form-row">
        <label for="email">Usuario o Email*</label>

        <div class="icon-field">
          <i class="pi pi-user"></i>
          <input
            pInputText
            id="email"
            type="email"
            name="email"
            [(ngModel)]="email"
            #emailModel="ngModel"
            required
            email
            autocomplete="email"
            autofocus
            class="w-full with-icon"
            [ngClass]="{'invalid': submitted && emailModel.invalid}"
          />
        </div>

        <div class="err" *ngIf="submitted && emailModel.errors?.['required']">
          El email es obligatorio.
        </div>
        <div class="err" *ngIf="submitted && emailModel.errors?.['email']">
          Ingresa un email válido.
        </div>
      </div>

      <!-- Contraseña -->
      <div class="form-row">
        <label for="password">Contraseña*</label>

        <div class="icon-field">
          <i class="pi pi-lock"></i>
          <p-password
            inputId="password"
            name="password"
            [(ngModel)]="password"
            #passwordModel="ngModel"
            required
            [feedback]="false"
            [toggleMask]="true"
            [inputStyleClass]="(submitted && passwordModel.invalid) ? 'with-icon invalid' : 'with-icon'"
            styleClass="has-prefix-icon"
          ></p-password>
        </div>

        <div class="err" *ngIf="submitted && passwordModel.invalid">
          La contraseña es obligatoria.
        </div>
      </div>

      <!-- Recordarme / Olvidaste -->
      <div class="form-row">
        <div class="row-sm">
          <label class="row-left" for="remember">
            <p-checkbox [(ngModel)]="remember" name="remember" binary="true" inputId="remember"></p-checkbox>
            <span class="p-link">Recordarme</span>
          </label>
          <a href="#" class="text-violet-600 hover:underline">¿Olvidaste tu contraseña?</a>
        </div>
      </div>

      <!-- Botón -->
      <div class="form-row">
        <button
          pButton
          type="submit"
          [label]="loading() ? 'Ingresando…' : 'Iniciar Sesión'"
          [icon]="loading() ? 'pi pi-spinner pi-spin' : ''"
          iconPos="left"
          class="btn-primary w-full"
          [disabled]="loading()"
        ></button>
      </div>
    </form>
  `,
  styles: [`
    :host{
      display:block;
      --form-w: clamp(280px, 55vw, 520px);
    }

    .form{ display:grid; gap: 24px; }
    .form-row{ width: 100%; max-width: var(--form-w); }

    h1{
      font-size: clamp(48px, 6vw, 64px);
      font-weight: 800;
      line-height: 1.05;
      letter-spacing: -0.01em;
      color: #0f172a;
      margin-bottom: .75rem;
    }
    .sub{
      font-size: clamp(14px, 1.05vw, 16px);
      color: #1f2937;
      font-weight: 600;
      margin-bottom: 2rem;
    }
    label{
      display:block;
      font-size: clamp(14px, 1.05vw, 16px);
      font-weight: 700;
      color: #0f172a;
      margin-bottom: .25rem;
    }

    :host ::ng-deep .p-password{ display:block; width:100%; }

    .p-inputtext{
      height: 52px;
      font-size: 16px;
      border-radius: 12px;
      border: 1px solid #cbd5e1;
      padding: 0 .75rem;
      width: 100%;
      box-sizing: border-box;
      transition: border-color .15s, box-shadow .15s;
    }
    .p-inputtext:focus{
      outline: 0;
      border-color: var(--p-primary-500);
      box-shadow: 0 0 0 5px color-mix(in srgb, var(--p-primary-500) 30%, transparent);
    }
    :host ::ng-deep .p-password .p-inputtext{
      height: 52px;
      font-size: 16px;
      border-radius: 12px;
      border: 1px solid #cbd5e1;
      padding: 0 .75rem;
      width: 100%;
      box-sizing: border-box;
      transition: border-color .15s, box-shadow .15s;
    }
    :host ::ng-deep .p-password .p-inputtext:focus{
      outline: 0;
      border-color: var(--p-primary-500);
      box-shadow: 0 0 0 5px color-mix(in srgb, var(--p-primary-500) 30%, transparent);
    }

    /* Íconos en campos */
    .icon-field{ position: relative; }
    .icon-field > i{
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1rem;
      color: #64748b;
      pointer-events: none;
      z-index: 2;
    }
    .with-icon{ padding-left: 2.25rem !important; }

    /* Forzar padding a p-password cuando tiene icono prefix */
    :host ::ng-deep .has-prefix-icon .p-inputtext{
      padding-left: 2.25rem !important;
    }
    /* Algunas versiones agregan una clase auxiliar; la cubrimos también */
    :host ::ng-deep .has-prefix-icon .p-password-input{
      padding-left: 2.25rem !important;
    }

    /* Validación simple */
    .invalid{
      border-color: #ef4444 !important;
      box-shadow: 0 0 0 5px color-mix(in srgb, #ef4444 20%, transparent) !important;
    }
    .err{
      margin-top: 6px;
      font-size: 12px;
      color: #b91c1c;
      font-weight: 600;
    }

    /* Recordarme + Olvidaste */
    .row-sm{
      display:flex; align-items:center; justify-content:space-between;
      flex-wrap: wrap; gap:.5rem;
      font-size: 15px; color:#334155;
      margin-top: -4px;
    }
    .row-left{
      display:inline-flex; align-items:center; gap:.5rem;
      cursor: pointer;
      user-select: none;
    }

    :host ::ng-deep .p-checkbox .p-checkbox-box{
      width: 20px; height: 20px;
      border: 2px solid #94a3b8;
      border-radius: 6px;
      box-shadow: none;
      transition: border-color .15s, box-shadow .15s, background-color .15s;
    }
    :host ::ng-deep .p-checkbox:not(.p-disabled) .p-checkbox-box.p-focus{
      border-color: var(--p-primary-500);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--p-primary-500) 30%, transparent);
    }
    :host ::ng-deep .p-checkbox .p-checkbox-box.p-highlight{
      background: var(--p-primary-500);
      border-color: var(--p-primary-500);
      color: #fff;
    }
    :host ::ng-deep .p-checkbox .p-checkbox-icon{
      color: #fff; font-size: 12px;
    }

    .p-link, a{ font-weight: 600; }

    .btn-primary{
      width: 100%;
      height: 52px;
      border-radius: 9999px;
      font-size: 16px;
      font-weight: 700;
    }

    @media (max-width: 1023.98px){
      .form-row{ max-width: 100%; }
    }
  `]
})
export class SignInPage implements OnInit {
  email = '';
  password = '';
  remember = false;
  loading = signal(false);
  submitted = false;

  constructor(
    private session: SessionService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('rememberedEmail');
    if (saved) {
      this.email = saved;
      this.remember = true;
    }
  }

  onSubmit(f: NgForm) {
    this.submitted = true;

    if (f.invalid) {
      return; // solo errores inline, sin toast
    }

    this.loading.set(true);
    try {
      this.session.signIn(this.email, this.password);

      if (this.remember) {
        localStorage.setItem('rememberedEmail', this.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      this.router.navigateByUrl('/app');
    } finally {
      this.loading.set(false);
    }
  }
}
