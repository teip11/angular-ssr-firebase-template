import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../services/seo.service';
@Component({ selector: 'app-not-found', standalone: true, imports: [CommonModule, RouterModule],
  templateUrl: './not-found.component.html', styleUrl: './not-found.component.css' })
export class NotFoundComponent implements OnInit {
  constructor(private seo: SeoService) {}
  ngOnInit(): void { this.seo.setPageSEO('not-found'); }
}
