import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { CookieConsentService } from '../../services/cookie-consent.service';

@Component({
  selector: 'app-datenschutz',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './datenschutz.component.html',
  styleUrls: ['./datenschutz.component.css']
})
export class DatenschutzComponent implements OnInit {
  constructor(
    private seo: SeoService,
    private cookieConsent: CookieConsentService
  ) {}

  ngOnInit(): void {
    this.seo.setPageSEO('datenschutz');
  }

  resetConsent(): void {
    this.cookieConsent.reset();
  }
}
