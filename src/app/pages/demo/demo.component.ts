import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmailjsService, TEMPLATE_DEMO, TEMPLATE_AUTO_REPLY } from '../../services/emailjs.service';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent implements AfterViewInit, OnDestroy {
  private observers: IntersectionObserver[] = [];

  sending = false;
  sent = false;
  error = false;

  form = {
    name: '',
    email: '',
    company: '',
    description: '',
    hasWebsite: false,
    goals: {
      kunden: false,
      anfragen: false,
      onlinePraesenz: false
    },
    detailedGoals: '',
    inspiration: '',
    wishes: ''
  };

  constructor(
    private emailjs: EmailjsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnDestroy() {
    this.observers.forEach(o => o.disconnect());
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => this.initAnimations(), 150);
  }

  private initAnimations() {
    const observe = (selector: string, options: IntersectionObserverInit = {}) => {
      const els = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
      if (!els.length) return;
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('is-visible');
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0, ...options });
      this.observers.push(obs);
      els.forEach(el => obs.observe(el));
    };

    // ── Hero: already in viewport on load ────────────────────────────────────
    observe('.dmo-hero-label');
    observe('.dmo-hero-title');
    observe('.dmo-hero-sub');

    // ── Form card ─────────────────────────────────────────────────────────────
    observe('.dmo-form-card', { rootMargin: '0px 0px -40px 0px' });

    // ── Form steps: staggered ─────────────────────────────────────────────────
    const steps = Array.from(document.querySelectorAll('.dmo-form-step')) as HTMLElement[];
    if (steps.length) {
      const stepObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = parseInt((e.target as HTMLElement).dataset['idx'] || '0', 10);
            setTimeout(() => (e.target as HTMLElement).classList.add('is-visible'), idx * 120);
            stepObs.unobserve(e.target);
          }
        });
      }, { threshold: 0, rootMargin: '0px 0px -30px 0px' });
      this.observers.push(stepObs);
      steps.forEach((el, i) => {
        el.dataset['idx'] = String(i);
        stepObs.observe(el);
      });
    }

    // ── Submit area ───────────────────────────────────────────────────────────
    observe('.dmo-submit-area', { rootMargin: '0px 0px -30px 0px' });
  }

  async submit() {
    if (this.sending) return;
    this.sending = true;
    this.error = false;

    const goalsList = [
      this.form.goals.kunden        ? 'Mehr Kunden'          : '',
      this.form.goals.anfragen      ? 'Mehr Anfragen'        : '',
      this.form.goals.onlinePraesenz ? 'Online-Präsenz'      : ''
    ].filter(Boolean).join(', ') || '–';

    try {
      await this.emailjs.send(TEMPLATE_DEMO, {
        from_name:          this.form.name,
        from_email:         this.form.email,
        company:            this.form.company,
        beschreibung:       this.form.description,
        hat_website:        this.form.hasWebsite ? 'Ja' : 'Nein',
        ziele:              goalsList,
        detaillierte_ziele: this.form.detailedGoals,
        inspiration:        this.form.inspiration,
        sonstige_wuensche:  this.form.wishes,
        form_type:          'Demo-Anfrage'
      });

      // Send auto-reply to customer (fire-and-forget — don't block success state)
      this.emailjs.send(TEMPLATE_AUTO_REPLY, {
        from_name:  this.form.name,
        from_email: this.form.email
      }).catch(() => { /* silently ignore auto-reply failures */ });

      this.sent = true;
    } catch {
      this.error = true;
    } finally {
      this.sending = false;
    }
  }
}
