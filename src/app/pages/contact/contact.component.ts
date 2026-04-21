import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmailjsService, TEMPLATE_CONTACT } from '../../services/emailjs.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements AfterViewInit, OnDestroy {
  private observers: IntersectionObserver[] = [];

  sending = false;
  sent = false;
  error = false;

  form = {
    name: '',
    email: '',
    message: ''
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
    observe('.cnt-hero-title');
    observe('.cnt-hero-sub');

    // ── Form card ─────────────────────────────────────────────────────────────
    observe('.cnt-form-card', { rootMargin: '0px 0px -40px 0px' });

    // ── Email card ────────────────────────────────────────────────────────────
    observe('.cnt-email-card', { rootMargin: '0px 0px -40px 0px' });
  }

  async submit() {
    if (this.sending) return;
    this.sending = true;
    this.error = false;

    try {
      await this.emailjs.send(TEMPLATE_CONTACT, {
        from_name:  this.form.name,
        from_email: this.form.email,
        message:    this.form.message
      });
      this.sent = true;
    } catch {
      this.error = true;
    } finally {
      this.sending = false;
    }
  }
}
