import { Component } from '@angular/core';
import { SignInPage } from '../../../access/pages/sign-in/sign-in.page'; // reutiliza TU página actual

@Component({
  standalone: true,
  selector: 'app-admin-sign-in',
  imports: [SignInPage],
  template: `
    <!-- Hoy: mismo formulario que el público -->
    <app-sign-in></app-sign-in>
  `
})
export class AdminSignInPage {}
