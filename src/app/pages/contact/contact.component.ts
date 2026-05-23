import {
  Component, AfterViewInit, OnInit, OnDestroy,
  Inject, PLATFORM_ID,
  ViewChild, ElementRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailjsService, TEMPLATE_CONTACT, TEMPLATE_AUTO_REPLY } from '../../services/emailjs.service';
import { RecaptchaService } from '../../services/recaptcha.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent implements OnInit, AfterViewInit, OnDestroy {
  // ── Per-element template refs ──────────────────────────────────────────
  @ViewChild('kntHeroTitle', { read: ElementRef }) kntHeroTitle?: ElementRef<HTMLElement>;
  @ViewChild('kntHeroSub',   { read: ElementRef }) kntHeroSub?:   ElementRef<HTMLElement>;
  @ViewChild('kntFormCard',  { read: ElementRef }) kntFormCard?:  ElementRef<HTMLElement>;
  @ViewChild('kntFormSide',  { read: ElementRef }) kntFormSide?:  ElementRef<HTMLElement>;

  private observers: IntersectionObserver[] = [];

  // ── Form contract (preserved from legacy) ──────────────────────────────
  sending = false;
  sent = false;
  error = false;

  form = {
    name: '',
    email: '',
    message: '',
  };

  constructor(
    private emailjs: EmailjsService,
    private recaptcha: RecaptchaService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.seo.setPageSEO('contact');
    this.recaptcha.preload();
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => this.setupReveal(), 50);
  }

  ngOnDestroy(): void {
    this.observers.forEach(o => o.disconnect());
    this.observers = [];
  }

  private setupReveal(): void {
    const observe = (el: Element | undefined | null, threshold: number, rootMargin = '0px') => {
      if (!el) return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('has-entered');
            io.unobserve(e.target);
          }
        });
      }, { threshold, rootMargin });
      io.observe(el);
      this.observers.push(io);
    };

    observe(this.kntHeroTitle?.nativeElement, 0.1);
    observe(this.kntHeroSub?.nativeElement,   0.1);
    observe(this.kntFormCard?.nativeElement,  0.2);
    observe(this.kntFormSide?.nativeElement,  0.2);
  }

  async submit(): Promise<void> {
    if (this.sending) return;
    this.sending = true;
    this.error = false;

    try {
      // reCAPTCHA v3 first — if this throws we don't hit EmailJS at all.
      // In placeholder mode (no site key configured) execute() returns ''
      // and EmailJS just ignores the unknown field.
      const token = await this.recaptcha.execute('contact');

      await this.emailjs.send(TEMPLATE_CONTACT, {
        from_name:  this.form.name,
        from_email: this.form.email,
        message:    this.form.message,
        form_type:  'Kontakt-Anfrage',
        'g-recaptcha-response': token,
      });

      // Fire-and-forget auto-reply — failures here don't change UI state.
      this.emailjs.send(TEMPLATE_AUTO_REPLY, {
        from_name:  this.form.name,
        from_email: this.form.email,
      }).catch(() => { /* silently ignore */ });

      this.sent = true;
    } catch {
      this.error = true;
    } finally {
      this.sending = false;
    }
  }
}
