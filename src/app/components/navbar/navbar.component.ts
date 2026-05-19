import { Component, HostListener, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private platformId = inject(PLATFORM_ID);

  /** Floating nav fades in after scrolling past ~80% of first viewport. */
  visible = signal(false);

  private ticking = false;

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
}
