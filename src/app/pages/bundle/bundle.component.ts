import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, signal, computed, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { gsap } from 'gsap';
import { SHOP_PRODUCTS, ShopProduct } from '../shop/shop-products.data';

interface BundleStep {
  key: string;
  label: string;
  emoji: string;
  description: string;
  steps: string[];          // routineStep values that count for this bundle slot
}

const BUNDLE_STEPS: BundleStep[] = [
  { key: 'cleanse',   label: 'Step 1 — Cleanse',    emoji: '🫧', description: 'Start clean. Double-cleanse or use a gentle foam.', steps: ['cleanser'] },
  { key: 'tone',      label: 'Step 2 — Tone',       emoji: '💦', description: 'Balance pH and prep skin to absorb what comes next.', steps: ['toner'] },
  { key: 'treat',     label: 'Step 3 — Treat',      emoji: '✨', description: 'Your targeted serum or ampoule. The hero of your routine.', steps: ['serum', 'ampoule'] },
  { key: 'moisturize',label: 'Step 4 — Moisturize', emoji: '🌸', description: 'Lock in layers and strengthen your skin barrier.', steps: ['moisturizer'] },
  { key: 'protect',   label: 'Step 5 — Protect',    emoji: '☀️', description: 'SPF every morning — the #1 anti-aging step.', steps: ['spf'] },
];

const SKIN_LABELS: Record<string, string> = {
  dry: '🌵 Dry', oily: '✨ Oily', combo: '☯️ Combo', normal: '🌸 Normal', sensitive: '🌼 Sensitive',
};

@Component({
  selector: 'app-bundle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bundle.component.html',
  styleUrl: './bundle.component.css'
})
export class BundleComponent implements OnInit, OnDestroy {

  private gsapCtx: any;

  readonly bundleSteps = BUNDLE_STEPS;
  readonly skinLabels  = SKIN_LABELS;
  readonly DISCOUNT    = 0.20;

  // Which step the user is currently viewing
  activeStepKey = signal<string>('cleanse');

  // Map of stepKey → selected product
  selections = signal<Record<string, ShopProduct>>({});

  // Skin type from quiz (optional)
  quizSkinType = signal<string | null>(null);

  // Products per step (filtered by skin type if quiz taken)
  productsForStep = computed(() => {
    const skin = this.quizSkinType();
    const result: Record<string, ShopProduct[]> = {};
    for (const bs of BUNDLE_STEPS) {
      let pool = SHOP_PRODUCTS.filter(p => bs.steps.includes(p.routineStep));
      if (skin && skin !== 'all') {
        // Prefer skin-specific, fall back to universal
        const specific = pool.filter(p => p.skinTypes.includes(skin));
        const universal = pool.filter(p =>
          !p.skinTypes.includes(skin) &&
          p.skinTypes.includes('normal') && p.skinTypes.includes('combo') &&
          !p.skinTypes.includes('dry') && !p.skinTypes.includes('oily') && !p.skinTypes.includes('sensitive')
        );
        pool = [...specific, ...universal];
      }
      result[bs.key] = pool.slice(0, 12);  // show top 12 per step
    }
    return result;
  });

  // Total before discount
  subtotal = computed(() => {
    return Object.values(this.selections()).reduce((sum, p) => sum + p.sellPrice, 0);
  });

  // Discount amount
  discountAmount = computed(() => {
    const sel = this.selections();
    const filled = BUNDLE_STEPS.filter(bs => sel[bs.key]).length;
    if (filled < BUNDLE_STEPS.length) return 0;
    return this.subtotal() * this.DISCOUNT;
  });

  // Final price
  bundleTotal = computed(() => this.subtotal() - this.discountAmount());

  // Steps completed
  completedSteps = computed(() => {
    const sel = this.selections();
    return BUNDLE_STEPS.filter(bs => sel[bs.key]).length;
  });

  isBundleComplete = computed(() => this.completedSteps() === BUNDLE_STEPS.length);

  // Progress pct for the progress bar
  progressPct = computed(() => (this.completedSteps() / BUNDLE_STEPS.length) * 100);

  constructor(
    private meta: Meta,
    @Inject(PLATFORM_ID) private platformId: Object,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
      const saved = localStorage.getItem('gs_skin_type');
      if (saved) this.quizSkinType.set(saved);
    }
    setTimeout(() => this.initAnimations(), 100);
  }

  private initAnimations(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.gsapCtx = gsap.context(() => {
      gsap.from('.gb-hero', { opacity: 0, y: -20, duration: 0.5, ease: 'power2.out' });
      gsap.from('.gb-stepper', { opacity: 0, y: 20, duration: 0.5, delay: 0.15 });
      gsap.from('.gb-basket', { opacity: 0, x: 30, duration: 0.5, delay: 0.2 });
    }, this.el);
  }

  setActiveStep(key: string): void {
    this.activeStepKey.set(key);
    if (isPlatformBrowser(this.platformId)) {
      const panel = document.querySelector('.gb-product-panel');
      if (panel) gsap.fromTo(panel, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3 });
    }
  }

  selectProduct(stepKey: string, product: ShopProduct): void {
    const prev = this.selections();
    const wasEmpty = !prev[stepKey];
    this.selections.set({ ...prev, [stepKey]: product });

    if (isPlatformBrowser(this.platformId)) {
      // Animate the basket row
      setTimeout(() => {
        const row = document.querySelector(`.gb-basket-row[data-step="${stepKey}"]`);
        if (row) gsap.fromTo(row, { background: '#fde8e0' }, { background: 'transparent', duration: 0.6 });
      }, 30);

      // If bundle just completed — fire confetti animation
      if (wasEmpty && this.isBundleComplete()) {
        this.celebrateComplete();
        // Auto-advance: don't change step so user sees the complete state
      } else if (wasEmpty) {
        // Auto-advance to next step
        const idx = BUNDLE_STEPS.findIndex(s => s.key === stepKey);
        if (idx < BUNDLE_STEPS.length - 1) {
          setTimeout(() => this.setActiveStep(BUNDLE_STEPS[idx + 1].key), 300);
        }
      }
    }
  }

  removeProduct(stepKey: string): void {
    const prev = { ...this.selections() };
    delete prev[stepKey];
    this.selections.set(prev);
  }

  private celebrateComplete(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const banner = document.querySelector('.gb-discount-banner');
    if (banner) {
      gsap.fromTo(banner,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.8)' }
      );
    }
    const total = document.querySelector('.gb-bundle-total');
    if (total) {
      gsap.from(total, { scale: 1.3, duration: 0.4, ease: 'elastic.out(1.5, 0.4)' });
    }
  }

  isSelected(stepKey: string, productId: number): boolean {
    return this.selections()[stepKey]?.id === productId;
  }

  getStepStatus(stepKey: string): 'empty' | 'selected' | 'active' {
    if (this.activeStepKey() === stepKey) return 'active';
    if (this.selections()[stepKey]) return 'selected';
    return 'empty';
  }

  formatPrice(n: number): string {
    return '$' + n.toFixed(2);
  }

  ngOnDestroy(): void {
    if (this.gsapCtx) this.gsapCtx.revert();
  }
}
