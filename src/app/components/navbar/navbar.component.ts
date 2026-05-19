import { Component, HostListener, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavigationStart, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  /** Floating nav fades in after scrolling past ~80% of first viewport. */
  visible = signal(false);

  /** Mobile drawer state. Toggled by burger; closes on link click / route change / Escape. */
  drawerOpen = signal(false);

  /** Floating-pill nav items. Labels are split into chars for the wave-flip effect. */
  readonly navLinks: ReadonlyArray<{ path: string; label: string; chars: string[] }> = [
    { path: '/projekte',   label: 'Projekte' },
    { path: '/leistungen', label: 'Leistungen' },
    { path: '/ueber-uns',  label: 'Über uns' },
    { path: '/blog',       label: 'Blog' },
    { path: '/kontakt',    label: 'Kontakt' },
  ].map(l => ({ ...l, chars: [...l.label] }));

  private ticking = false;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events.subscribe(ev => {
        if (ev instanceof NavigationStart) this.closeDrawer();
      });
    }
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.ticking) return;
    this.ticking = true;
    window.requestAnimationFrame(() => {
      this.ticking = false;
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const threshold = window.innerHeight * 0.80;
      this.visible.set(scrollTop > threshold);
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.drawerOpen()) this.closeDrawer();
  }

  toggleDrawer(): void {
    this.drawerOpen.update(v => !v);
    this.syncBodyClass();
  }

  closeDrawer(): void {
    if (!this.drawerOpen()) return;
    this.drawerOpen.set(false);
    this.syncBodyClass();
  }

  private syncBodyClass(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.body.classList.toggle('drawer-open', this.drawerOpen());
  }
}
