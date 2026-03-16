import {
  Component, OnInit, AfterViewInit, OnDestroy,
  Inject, PLATFORM_ID, ElementRef, signal, computed
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Meta } from '@angular/platform-browser';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SHOP_PRODUCTS, ShopProduct } from './shop-products.data';

type SortOrder = 'best' | 'price-asc' | 'price-desc' | 'newest';

export const STEP_LABELS: Record<string, string> = {
  all:         'All Products',
  serum:       'Serums',
  moisturizer: 'Moisturizers',
  cleanser:    'Cleansers',
  spf:         'SPF / Sun',
  treatment:   'Treatments',
  ampoule:     'Ampoules',
  toner:       'Toners',
  mask:        'Sheet Masks',
  eye:         'Eye Care',
};

export const STEP_ICONS: Record<string, string> = {
  all:         '🛍️',
  serum:       '✨',
  moisturizer: '🌸',
  cleanser:    '🫧',
  spf:         '☀️',
  treatment:   '💊',
  ampoule:     '💧',
  toner:       '💦',
  mask:        '🎭',
  eye:         '👁️',
};

export const SKIN_META: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  dry:       { emoji: '🌵', label: 'Dry',         color: '#c4855a', bg: '#fff5ee' },
  oily:      { emoji: '✨', label: 'Oily',        color: '#2d9b8a', bg: '#edfaf7' },
  combo:     { emoji: '☯️', label: 'Combo',       color: '#8a5cb4', bg: '#f5f0ff' },
  normal:    { emoji: '🌸', label: 'Normal',      color: '#e91e8c', bg: '#fff0f7' },
  sensitive: { emoji: '🌼', label: 'Sensitive',   color: '#c49a00', bg: '#fffbee' },
};

const PAGE_SIZE = 48;

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit, AfterViewInit, OnDestroy {

  private gsapCtx: any;

  // ── Filter state ─────────────────────────────────────────────
  activeStep      = signal<string>('all');
  activeSkinType  = signal<string>('all');
  sortOrder       = signal<SortOrder>('best');
  searchQuery     = signal<string>('');
  priceMax        = signal<number>(300);
  sidebarOpen     = signal<boolean>(false);
  currentPage     = signal<number>(1);

  // ── Cart / bundle state ───────────────────────────────────────
  cartCount        = signal(0);
  bundleCount      = signal(0);
  addedProductId   = signal<number | null>(null);
  bundleProductId  = signal<number | null>(null);
  quizSkinType     = signal<string | null>(null);
  bannerDismissed  = signal(false);

  // ── Static data ───────────────────────────────────────────────
  readonly allProducts  = SHOP_PRODUCTS;
  readonly stepLabels   = STEP_LABELS;
  readonly stepIcons    = STEP_ICONS;
  readonly skinMeta     = SKIN_META;
  readonly steps        = Object.keys(STEP_LABELS);
  readonly skinTypes    = ['all', ...Object.keys(SKIN_META)];
  readonly sortOptions: { value: SortOrder; label: string }[] = [
    { value: 'best',       label: '⭐ Best Match' },
    { value: 'price-asc',  label: '💰 Price: Low → High' },
    { value: 'price-desc', label: '💎 Price: High → Low' },
    { value: 'newest',     label: '🆕 Newest First' },
  ];

  // ── Derived: all matching products ───────────────────────────
  filteredProducts = computed(() => {
    const step  = this.activeStep();
    const skin  = this.activeSkinType();
    const sort  = this.sortOrder();
    const query = this.searchQuery().toLowerCase().trim();
    const pmax  = this.priceMax();

    let r = [...this.allProducts];

    if (step !== 'all') r = r.filter(p => p.routineStep === step);

    if (skin !== 'all') {
      r = r.filter(p =>
        p.skinTypes.includes(skin) ||
        (p.skinTypes.includes('normal') && p.skinTypes.includes('combo') &&
         !p.skinTypes.includes('dry') && !p.skinTypes.includes('oily') && !p.skinTypes.includes('sensitive'))
      );
    }

    if (query) {
      r = r.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.routineStep.toLowerCase().includes(query)
      );
    }

    r = r.filter(p => p.sellPrice <= pmax);

    switch (sort) {
      case 'price-asc':  r.sort((a, b) => a.sellPrice - b.sellPrice); break;
      case 'price-desc': r.sort((a, b) => b.sellPrice - a.sellPrice); break;
      case 'newest':     r.sort((a, b) => b.id - a.id); break;
      default:           r.sort((a, b) => b.bundleScore - a.bundleScore); break;
    }

    return r;
  });

  // ── Page slice ────────────────────────────────────────────────
  pagedProducts = computed(() => {
    const page = this.currentPage();
    const all  = this.filteredProducts();
    const start = (page - 1) * PAGE_SIZE;
    return all.slice(start, start + PAGE_SIZE);
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredProducts().length / PAGE_SIZE))
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  showingFrom = computed(() => {
    const page = this.currentPage();
    const total = this.filteredProducts().length;
    if (total === 0) return 0;
    return (page - 1) * PAGE_SIZE + 1;
  });

  showingTo = computed(() => {
    const page = this.currentPage();
    const total = this.filteredProducts().length;
    return Math.min(page * PAGE_SIZE, total);
  });

  // ── Step counts ───────────────────────────────────────────────
  stepCount = computed(() => {
    const skin  = this.activeSkinType();
    const query = this.searchQuery().toLowerCase().trim();
    const pmax  = this.priceMax();
    const counts: Record<string, number> = {};

    for (const p of this.allProducts) {
      const skinOk = skin === 'all' || p.skinTypes.includes(skin) ||
        (p.skinTypes.includes('normal') && p.skinTypes.includes('combo') &&
         !p.skinTypes.includes('dry') && !p.skinTypes.includes('oily') && !p.skinTypes.includes('sensitive'));
      const queryOk = !query || p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query);
      const priceOk = p.sellPrice <= pmax;

      if (skinOk && queryOk && priceOk) {
        counts['all'] = (counts['all'] || 0) + 1;
        counts[p.routineStep] = (counts[p.routineStep] || 0) + 1;
      }
    }
    return counts;
  });

  // ── Active filter chips ───────────────────────────────────────
  activeFilters = computed(() => {
    const chips: { label: string; key: string }[] = [];
    const step = this.activeStep();
    const skin = this.activeSkinType();
    const q    = this.searchQuery().trim();

    if (step !== 'all') chips.push({ label: `${STEP_ICONS[step]} ${STEP_LABELS[step]}`, key: 'step' });
    if (skin !== 'all') chips.push({ label: `${SKIN_META[skin].emoji} ${SKIN_META[skin].label} skin`, key: 'skin' });
    if (q)              chips.push({ label: `🔍 "${q}"`, key: 'search' });
    return chips;
  });

  hasActiveFilters = computed(() =>
    this.activeStep() !== 'all' || this.activeSkinType() !== 'all' || this.searchQuery().trim().length > 0
  );

  constructor(
    private meta: Meta,
    @Inject(PLATFORM_ID) private platformId: Object,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    if (isPlatformBrowser(this.platformId)) {
      gsap.registerPlugin(ScrollTrigger);
      window.scrollTo(0, 0);
      const saved = localStorage.getItem('gs_skin_type');
      if (saved && SKIN_META[saved]) {
        this.quizSkinType.set(saved);
        this.activeSkinType.set(saved);
      }
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    gsap.from('.gs-shop-topbar', { opacity: 0, y: -20, duration: 0.5, delay: 0.1 });
    gsap.from('.gs-sidebar', { opacity: 0, x: -24, duration: 0.5, delay: 0.2 });
    this.animateCards();
  }

  animateCards(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => {
      const cards = document.querySelectorAll('.gs-shop-card');
      if (!cards.length) return;
      gsap.fromTo(cards,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.03, ease: 'power2.out', clearProps: 'transform' }
      );
    }, 20);
  }

  // ── Filter actions ────────────────────────────────────────────
  setStep(step: string): void {
    this.activeStep.set(step);
    this.currentPage.set(1);
    this.animateCards();
  }

  setSkinType(skin: string): void {
    this.activeSkinType.set(skin);
    this.currentPage.set(1);
    this.animateCards();
  }

  setSort(s: SortOrder): void {
    this.sortOrder.set(s);
    this.currentPage.set(1);
  }

  onSearch(q: string): void {
    this.searchQuery.set(q);
    this.currentPage.set(1);
  }

  removeFilter(key: string): void {
    if (key === 'step')   { this.activeStep.set('all'); }
    if (key === 'skin')   { this.activeSkinType.set('all'); }
    if (key === 'search') { this.searchQuery.set(''); }
    this.currentPage.set(1);
    this.animateCards();
  }

  clearAllFilters(): void {
    this.activeStep.set('all');
    this.activeSkinType.set('all');
    this.sortOrder.set('best');
    this.searchQuery.set('');
    this.priceMax.set(300);
    this.currentPage.set(1);
    this.animateCards();
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  dismissBanner(): void { this.bannerDismissed.set(true); }

  // ── Pagination ────────────────────────────────────────────────
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    if (isPlatformBrowser(this.platformId)) {
      const el = document.querySelector('.gs-shop-main');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    this.animateCards();
  }

  // ── Cart / Bundle ─────────────────────────────────────────────
  addToCart(p: ShopProduct, btn: HTMLElement): void {
    this.cartCount.update(c => c + 1);
    this.addedProductId.set(p.id);
    if (isPlatformBrowser(this.platformId)) {
      gsap.timeline()
        .to(btn, { scale: 0.88, duration: 0.08 })
        .to(btn, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
    }
    setTimeout(() => this.addedProductId.set(null), 1800);
  }

  addToBundle(p: ShopProduct, btn: HTMLElement): void {
    this.bundleCount.update(c => c + 1);
    this.bundleProductId.set(p.id);
    if (isPlatformBrowser(this.platformId)) {
      gsap.timeline()
        .to(btn, { scale: 0.88, duration: 0.08 })
        .to(btn, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
    }
    setTimeout(() => this.bundleProductId.set(null), 1800);
  }

  // ── Helpers ───────────────────────────────────────────────────
  isSkinMatch(p: ShopProduct): boolean {
    const skin = this.activeSkinType();
    if (skin === 'all') return false;
    return p.skinTypes.includes(skin) &&
      !(p.skinTypes.includes('normal') && p.skinTypes.includes('combo') &&
        !p.skinTypes.includes('dry') && !p.skinTypes.includes('oily') && !p.skinTypes.includes('sensitive'));
  }

  getSkinBadge(p: ShopProduct): string {
    if (this.isSkinMatch(p)) {
      const skin = this.activeSkinType();
      return SKIN_META[skin]?.emoji + ' Perfect Match';
    }
    if (p.skinTypes.length >= 4) return '🌍 All Skin Types';
    return '';
  }

  getStepBadge(p: ShopProduct): string {
    return STEP_ICONS[p.routineStep] ?? '';
  }

  getSavePct(sell: number, cost: number): number {
    const retail = cost * 3;
    return Math.round((1 - sell / retail) * 100);
  }

  trackById(_: number, p: ShopProduct): number { return p.id; }

  ngOnDestroy(): void {
    if (this.gsapCtx) this.gsapCtx.revert();
    if (isPlatformBrowser(this.platformId)) ScrollTrigger.getAll().forEach(t => t.kill());
  }
}
