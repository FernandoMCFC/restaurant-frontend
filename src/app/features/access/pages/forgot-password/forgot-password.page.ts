import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
  template: `
  <h1 style="font-size:28px;margin:0 0 12px;">Has olvidado tu contraseña</h1>
  <p style="margin:0 0 16px;color:#64748b">Le enviaremos un enlace por correo electrónico para restablecerlo cuando el backend esté listo.</p>
  <form style="display:grid;gap:12px;max-width:360px">
    <label>
      <span class="block mb-2">Email address*</span>
      <input pInputText type="email" required />
    </label>
    <button pButton type="button" label="Enviar enlace"></button>
  </form>
  `
})
export class ForgotPasswordPage {}
