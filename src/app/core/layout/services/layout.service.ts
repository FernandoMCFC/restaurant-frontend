import { Injectable, computed } from '@angular/core';
// Adaptamos al store nuevo
import { UiStore } from '../../../components/layout/ui.store';


@Injectable({ providedIn: 'root' })
export class LayoutService {
  constructor(private ui: UiStore) {}

  /**
   * Mantiene compatibilidad con app-shell:
   * app-shell llama this.layout.sidebarActive() como un signal,
   * por eso lo exponemos como computed invocable.
   * En móvil: equivale al drawer abierto/cerrado.
   */
  sidebarActive = computed(() => this.ui.isMobileDrawerOpen());

  /**
   * Equivale al botón hamburguesa:
   * - En móvil: abre/cierra el drawer.
   * - En desktop: colapsa/expande el sidebar.
   */
  toggleSidebar() {
    this.ui.toggleSidebar();
  }

  /**
   * Cierra el overlay/drawer del sidebar en móvil.
   */
  hideSidebar() {
    this.ui.closeDrawer();
  }
}
