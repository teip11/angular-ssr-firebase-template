import {
  Component, OnInit, OnDestroy, AfterViewInit,
  Inject, PLATFORM_ID, ElementRef, NgZone
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {

  isMenuOpen = false;

  private gsap: any         = null;
  private menuTimeline: any = null;
  private hamTimeline: any  = null;
  private listeners: Array<() => void> = [];
  private routerSub = new Subscription();

  // TODO: Update nav links to match your site pages
  navLinks = [
    { label: 'Home',    path: '/',        exact: true  },
    { label: 'Shop',    path: '/shop',    exact: false },
    { label: 'Quiz',    path: '/quiz',    exact: false },
    { label: 'Blog',    path: '/blog',    exact: false },
    { label: 'About',   path: '/about',   exact: false },
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public router: Router,
    private el: ElementRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isMenuOpen) this.animateSheetClose();
      if (this.gsap) {
        setTimeout(() => this.updateIndicator(), 80);
      }
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.initGsap(reduced);
    }
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    this.menuTimeline?.kill();
    this.hamTimeline?.kill();
    this.listeners.forEach(fn => fn());
    this.listeners = [];
  }

  toggleMenu(): void {
    this.isMenuOpen ? this.animateSheetClose() : this.animateSheetOpen();
  }

  closeMenu(): void {
    if (this.isMenuOpen) this.animateSheetClose();
  }

  handleSheetLinkTap(e: MouseEvent): void {
    const target = e.currentTarget as HTMLElement;
    if (this.gsap) {
      this.gsap.timeline()
        .to(target, { scale: 1.05,  duration: 0.08, ease: 'power2.out' })
        .to(target, { scale: 1,     duration: 0.28, ease: 'elastic.out(1.2, 0.5)' });
    }
    setTimeout(() => this.closeMenu(), 60);
  }

  private async initGsap(reduced: boolean): Promise<void> {
    const gsapModule = await import('gsap');
    const gsap = gsapModule.gsap;
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);

    this.gsap = gsap;

    const root  = this.el.nativeElement as HTMLElement;
    const navEl = root.querySelector('.navbar')        as HTMLElement;
    const sheet = root.querySelector('.navbar__sheet') as HTMLElement;
    const scrim = root.querySelector('.navbar__scrim') as HTMLElement;

    gsap.set(sheet, { y: '100%' });
    gsap.set(scrim, { opacity: 0 });

    this.wireScrollBlur(gsap, ScrollTrigger, navEl);

    if (reduced) {
      this.updateIndicator();
      return;
    }

    this.runEntranceAnimation(gsap, root);

    setTimeout(() => {
      this.updateIndicator();
      this.wireMagneticHover(gsap, root);
      this.wireGsapHover(gsap, root);
      this.wireCtaHover(gsap, root);
    }, 300);
  }

  private runEntranceAnimation(gsap: any, root: HTMLElement): void {
    const navEl = root.querySelector('.navbar')       as HTMLElement;
    const logo  = root.querySelector('.navbar__logo') as HTMLElement;
    const links = root.querySelectorAll('.navbar__link-inner');
    const cta   = root.querySelector('.navbar__cta')  as HTMLElement;

    gsap.timeline()
      .fromTo(navEl,  { y: -(navEl.offsetHeight + 10), opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power4.out' })
      .fromTo(logo,   { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, '-=0.35')
      .fromTo(links,  { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.38, stagger: 0.07, ease: 'power2.out' }, '-=0.28')
      .fromTo(cta,    { scale: 0.82, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2.2)' }, '-=0.18');
  }

  private wireScrollBlur(gsap: any, ScrollTrigger: any, navEl: HTMLElement): void {
    ScrollTrigger.create({
      start: 0,
      end: 80,
      onUpdate: (self: any) => {
        const p   = self.progress;
        const bl  = (14 + p * 6).toFixed(1);
        const sat = (1.2 + p * 0.2).toFixed(2);
        const bgA = (0.88 + p * 0.08).toFixed(3);
        navEl.style.backdropFilter               = `blur(${bl}px) saturate(${sat})`;
        (navEl.style as any).webkitBackdropFilter = `blur(${bl}px) saturate(${sat})`;
        navEl.style.background                   = `rgba(15, 10, 18, ${bgA})`;
        navEl.style.borderBottomColor             = `rgba(225, 29, 106, ${(0.06 + p * 0.08).toFixed(3)})`;
      }
    });
  }

  private updateIndicator(): void {
    if (!this.gsap) return;
    const gsap = this.gsap;
    const root = this.el.nativeElement as HTMLElement;

    setTimeout(() => {
      const active    = root.querySelector('.navbar__link--active') as HTMLElement;
      const indicator = root.querySelector('.nav-indicator')         as HTMLElement;
      const linksUl   = root.querySelector('.navbar__links')         as HTMLElement;
      if (!active || !indicator || !linksUl) return;

      const ar  = active.getBoundingClientRect();
      const ulr = linksUl.getBoundingClientRect();

      gsap.to(indicator, {
        x: ar.left - ulr.left,
        width: ar.width,
        opacity: 1,
        duration: 0.65,
        ease: 'elastic.out(1, 0.55)'
      });
    }, 50);
  }

  private wireMagneticHover(gsap: any, root: HTMLElement): void {
    const links = root.querySelectorAll('.navbar__link');
    links.forEach((link: Element) => {
      const inner = link.querySelector('.navbar__link-inner') as HTMLElement;
      if (!inner) return;
      const xTo = gsap.quickTo(inner, 'x', { duration: 0.4, ease: 'power3.out' });
      const yTo = gsap.quickTo(inner, 'y', { duration: 0.4, ease: 'power3.out' });
      const onMove  = (e: MouseEvent) => {
        const r = link.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width  / 2)) * 0.3);
        yTo((e.clientY - (r.top  + r.height / 2)) * 0.3);
      };
      const onLeave = () => { xTo(0); yTo(0); };
      link.addEventListener('mousemove',  onMove as EventListener);
      link.addEventListener('mouseleave', onLeave);
      this.listeners.push(
        () => link.removeEventListener('mousemove',  onMove as EventListener),
        () => link.removeEventListener('mouseleave', onLeave)
      );
    });
  }

  private wireGsapHover(gsap: any, root: HTMLElement): void {
    const links = root.querySelectorAll('.navbar__link');
    links.forEach((link: Element) => {
      const inner = link.querySelector('.navbar__link-inner') as HTMLElement;
      if (!inner) return;
      const onEnter = () => {
        if (link.classList.contains('navbar__link--active')) return;
        gsap.to(inner, { scale: 1.04, color: '#fdf2f8', duration: 0.18, ease: 'power2.out', overwrite: 'auto' });
      };
      const onLeave = () => {
        if (link.classList.contains('navbar__link--active')) return;
        gsap.to(inner, { scale: 1, color: '#9d7fb8', duration: 0.22, ease: 'power2.out', overwrite: 'auto' });
      };
      link.addEventListener('mouseenter', onEnter);
      link.addEventListener('mouseleave', onLeave);
      this.listeners.push(
        () => link.removeEventListener('mouseenter', onEnter),
        () => link.removeEventListener('mouseleave', onLeave)
      );
    });
  }

  private wireCtaHover(gsap: any, root: HTMLElement): void {
    const cta     = root.querySelector('.navbar__cta')         as HTMLElement;
    const ctaText = root.querySelector('.navbar__cta-text')    as HTMLElement;
    const shimmer = root.querySelector('.navbar__cta-shimmer') as HTMLElement;
    if (!cta || !ctaText) return;

    const xTo = gsap.quickTo(ctaText, 'x', { duration: 0.35, ease: 'power3.out' });
    const yTo = gsap.quickTo(ctaText, 'y', { duration: 0.35, ease: 'power3.out' });

    const onMove  = (e: MouseEvent) => {
      const r = cta.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width  / 2)) * 0.25);
      yTo((e.clientY - (r.top  + r.height / 2)) * 0.25);
    };
    const onEnter = () => {
      gsap.to(cta, { scale: 1.04, duration: 0.2, ease: 'back.out(2)', overwrite: 'auto' });
      if (shimmer) {
        gsap.fromTo(shimmer, { x: '-110%', opacity: 1 }, { x: '110%', opacity: 1, duration: 0.5, ease: 'sine.inOut' });
      }
    };
    const onLeave = () => {
      xTo(0); yTo(0);
      gsap.to(cta, { scale: 1, duration: 0.25, ease: 'power2.inOut', overwrite: 'auto' });
    };

    cta.addEventListener('mousemove',  onMove as EventListener);
    cta.addEventListener('mouseenter', onEnter);
    cta.addEventListener('mouseleave', onLeave);
    this.listeners.push(
      () => cta.removeEventListener('mousemove',  onMove as EventListener),
      () => cta.removeEventListener('mouseenter', onEnter),
      () => cta.removeEventListener('mouseleave', onLeave)
    );
  }

  private animateSheetOpen(): void {
    this.isMenuOpen = true;
    document.body.classList.add('menu-open');
    if (!this.gsap) return;
    const gsap   = this.gsap;
    const root   = this.el.nativeElement as HTMLElement;
    const sheet  = root.querySelector('.navbar__sheet')        as HTMLElement;
    const scrim  = root.querySelector('.navbar__scrim')        as HTMLElement;
    const items  = root.querySelectorAll('.navbar__sheet-item');
    const footer = root.querySelector('.navbar__sheet-footer') as HTMLElement;
    const handle = root.querySelector('.navbar__sheet-handle') as HTMLElement;

    if (this.menuTimeline) this.menuTimeline.kill();
    this.menuTimeline = gsap.timeline();
    this.menuTimeline
      .to(scrim,   { opacity: 1, duration: 0.22, ease: 'power2.out' })
      .fromTo(sheet,  { y: '100%' }, { y: '0%', duration: 0.42, ease: 'power4.out' }, '-=0.12')
      .fromTo(handle, { scaleX: 0.2, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.3, ease: 'back.out(3)' }, '-=0.28')
      .from(items,  { x: (i: number) => (i % 2 === 0 ? -30 : 30), y: 10, opacity: 0, duration: 0.38, stagger: 0.055, ease: 'power3.out' }, '-=0.22')
      .fromTo(footer, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: 'power2.out' }, '-=0.12');

    this.morphHamToX(gsap, root);
  }

  private animateSheetClose(): void {
    this.ngZone.run(() => {
      this.isMenuOpen = false;
      document.body.classList.remove('menu-open');
    });
    if (!this.gsap) return;
    const gsap  = this.gsap;
    const root  = this.el.nativeElement as HTMLElement;
    const sheet = root.querySelector('.navbar__sheet') as HTMLElement;
    const scrim = root.querySelector('.navbar__scrim') as HTMLElement;

    if (this.menuTimeline) this.menuTimeline.kill();
    this.menuTimeline = gsap.timeline();
    this.menuTimeline
      .to(sheet, { y: '100%', duration: 0.3,  ease: 'power3.in' })
      .to(scrim,  { opacity: 0, duration: 0.2, ease: 'power2.in' }, '-=0.1');

    this.morphXToHam(gsap, root);
  }

  private morphHamToX(gsap: any, root: HTMLElement): void {
    const top = root.querySelector('.ham-top') as HTMLElement;
    const mid = root.querySelector('.ham-mid') as HTMLElement;
    const bot = root.querySelector('.ham-bot') as HTMLElement;
    if (!top || !mid || !bot) return;
    if (this.hamTimeline) this.hamTimeline.kill();
    this.hamTimeline = gsap.timeline();
    this.hamTimeline
      .to(mid, { scaleX: 0, opacity: 0, duration: 0.13, ease: 'power2.in', transformOrigin: 'center center' })
      .to(top, { y: 6,  duration: 0.17, ease: 'power2.out', transformOrigin: 'center center' }, '-=0.05')
      .to(bot, { y: -6, duration: 0.17, ease: 'power2.out', transformOrigin: 'center center' }, '<')
      .to(top, { rotation:  45, duration: 0.2, ease: 'power2.inOut', transformOrigin: 'center center' })
      .to(bot, { rotation: -45, duration: 0.2, ease: 'power2.inOut', transformOrigin: 'center center' }, '<');
  }

  private morphXToHam(gsap: any, root: HTMLElement): void {
    const top = root.querySelector('.ham-top') as HTMLElement;
    const mid = root.querySelector('.ham-mid') as HTMLElement;
    const bot = root.querySelector('.ham-bot') as HTMLElement;
    if (!top || !mid || !bot) return;
    if (this.hamTimeline) this.hamTimeline.kill();
    this.hamTimeline = gsap.timeline();
    this.hamTimeline
      .to([top, bot], { rotation: 0, duration: 0.17, ease: 'power2.in', transformOrigin: 'center center' })
      .to(top, { y: 0, duration: 0.15, ease: 'power2.out', transformOrigin: 'center center' }, '-=0.07')
      .to(bot, { y: 0, duration: 0.15, ease: 'power2.out', transformOrigin: 'center center' }, '<')
      .to(mid, { scaleX: 1, opacity: 1, duration: 0.22, ease: 'back.out(2.5)', transformOrigin: 'center center' }, '-=0.05');
  }
}
