import {
  Component, AfterViewInit, OnInit, OnDestroy,
  Inject, PLATFORM_ID,
  ViewChild, ViewChildren, ElementRef, QueryList,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailjsService, TEMPLATE_DEMO, TEMPLATE_AUTO_REPLY } from '../../services/emailjs.service';
import { RecaptchaService } from '../../services/recaptcha.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent implements OnInit, AfterViewInit, OnDestroy {
  // ── Per-element template refs ──────────────────────────────────────────
  @ViewChild('dmoHeroTitle',  { read: ElementRef }) dmoHeroTitle?:  ElementRef<HTMLElement>;
  @ViewChild('dmoHeroSub',    { read: ElementRef }) dmoHeroSub?:    ElementRef<HTMLElement>;
  @ViewChild('dmoFormCard',   { read: ElementRef }) dmoFormCard?:   ElementRef<HTMLElement>;
  @ViewChildren('dmoStep',    { read: ElementRef }) dmoSteps?:      QueryList<ElementRef<HTMLElement>>;
  @ViewChild('dmoSubmitArea', { read: ElementRef }) dmoSubmitArea?: ElementRef<HTMLElement>;

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
    private recaptcha: RecaptchaService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.seo.setPageSEO('demo');
    this.recaptcha.preload();
  }

  ngOnDestroy(): void {
    this.observers.forEach(o => o.disconnect());
    this.observers = [];
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => this.setupReveal(), 50);
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

    observe(this.dmoHeroTitle?.nativeElement,  0.1);
    observe(this.dmoHeroSub?.nativeElement,    0.1);
    observe(this.dmoFormCard?.nativeElement,   0.15);
    this.dmoSteps?.forEach(ref => observe(ref.nativeElement, 0.2));
    observe(this.dmoSubmitArea?.nativeElement, 0.2);
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
      // reCAPTCHA v3 first — placeholder mode returns '' until site key is set.
      const token = await this.recaptcha.execute('demo');

      await this.emailjs.send(TEMPLATE_DEMO, {
        from_name:              this.form.name,
        from_email:             this.form.email,
        company:                this.form.company,
        beschreibung:           this.form.description,
        hat_website:            this.form.hasWebsite ? 'Ja' : 'Nein',
        ziele:                  goalsList,
        detaillierte_ziele:     this.form.detailedGoals,
        inspiration:            this.form.inspiration,
        sonstige_wuensche:      this.form.wishes,
        form_type:              'Demo-Anfrage',
        'g-recaptcha-response': token,
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
