import { Injectable, signal } from '@angular/core';

export type PaymentsConfig = { cash: boolean; credit: boolean; };
export type CompanyData   = { name: string; description: string; phone: string; website: string; email: string; };
export type LocationData  = { street: string; city: string; country: string; };

@Injectable({ providedIn: 'root' })
export class SettingsService {
  payments = signal<PaymentsConfig>({ cash: true, credit: true });
  company  = signal<CompanyData>({
    name: 'Mi Restaurante',
    description: 'Parrilla y cocina de autor.',
    phone: '+591 700 00000',
    website: 'https://midominio.com',
    email: 'contacto@midominio.com',
  });
  location = signal<LocationData>({
    street: 'Av. Ejemplo 123',
    city: 'Cochabamba',
    country: 'Bolivia',
  });

  loadPayments(): PaymentsConfig { return this.payments(); }
  savePayments(value: PaymentsConfig) { this.payments.set(value); }

  loadCompany(): CompanyData { return this.company(); }
  saveCompany(value: CompanyData) { this.company.set(value); }

  loadLocation(): LocationData { return this.location(); }
  saveLocation(value: LocationData) { this.location.set(value); }
}
