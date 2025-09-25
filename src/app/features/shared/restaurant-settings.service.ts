import { Injectable } from '@angular/core';

export interface RestaurantSettings {
  payments: { cash: boolean; credit: boolean; };
  company: {
    name: string;
    description?: string;
    phone?: string;
    website?: string;
    email?: string;
  };
  location: { street: string; city: string; country: string; };
}

const LS_KEY = 'app.restaurant.settings';

@Injectable({ providedIn: 'root' })
export class RestaurantSettingsService {
  get(): RestaurantSettings | null {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) as RestaurantSettings : null;
    } catch { return null; }
  }
  save(payload: RestaurantSettings): void {
    try { localStorage.setItem(LS_KEY, JSON.stringify(payload)); } catch {}
  }
  clear(): void {
    try { localStorage.removeItem(LS_KEY); } catch {}
  }
}
