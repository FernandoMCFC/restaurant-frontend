import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, PasswordModule, ButtonModule],
  template: `
  <h1 style="font-size:28px;margin:0 0 12px;">Restablecer Contraseña</h1>
  <form (ngSubmit)="submit()" style="display:grid;gap:12px;max-width:360px">
    <label>
      <span class="block mb-2">Nueva contraseña*</span>
      <input pPassword [(ngModel)]="p1" name="p1" [feedback]="false" required />
    </label>
    <label>
      <span class="block mb-2">Confirmar contraseña*</span>
      <input pPassword [(ngModel)]="p2" name="p2" [feedback]="false" required />
    </label>
    <button pButton type="submit" label="Save" [disabled]="p1!==p2 || !p1"></button>
  </form>
  `
})
export class ResetPasswordPage {
  p1=''; p2=''; ok = signal(false);
  submit(){ this.ok.set(true); /* backend  despues */ }
}
