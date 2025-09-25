import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  isMobile = signal(false);

  // Sidebar
  isSidebarOverlayOpen = signal(false);   // overlay en móvil
  isSidebarCollapsed = signal(false);     // colapsado en desktop

  // Topbar height (px)
  topbarHeight = signal(64);

  openOverlay() { this.isSidebarOverlayOpen.set(true); }
  closeOverlay() { this.isSidebarOverlayOpen.set(false); }
  toggleOverlay() { this.isSidebarOverlayOpen.update(v => !v); }

  toggleCollapse() { this.isSidebarCollapsed.update(v => !v); }
  setMobile(v: boolean) { this.isMobile.set(v); }

  onNavigated() {
    if (this.isMobile()) this.closeOverlay();
  }
}
