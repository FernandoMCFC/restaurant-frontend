import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UiStore {
  // Desktop
  isSidebarCollapsed = signal(false);

  // Mobile
  isMobile = signal(false);
  isMobileDrawerOpen = signal(false);

  updateIsMobile(width = (typeof window !== 'undefined' ? window.innerWidth : 1200)) {
    const mobile = width <= 991;
    this.isMobile.set(mobile);
    if (!mobile) {
      this.isMobileDrawerOpen.set(false);
    }
  }

  toggleSidebar() {
    if (this.isMobile()) {
      this.isMobileDrawerOpen.set(!this.isMobileDrawerOpen());
    } else {
      this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
    }
  }

  openDrawer() {
    if (this.isMobile()) this.isMobileDrawerOpen.set(true);
  }

  closeDrawer() {
    this.isMobileDrawerOpen.set(false);
  }
}
