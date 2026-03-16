import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../services/seo.service';
@Component({ selector: 'app-about', standalone: true, imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html', styleUrl: './about.component.css' })
export class AboutComponent implements OnInit {
  constructor(private seo: SeoService) {}
  ngOnInit(): void { this.seo.setPageSEO('about'); }
}
