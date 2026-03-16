import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { SchemaService } from '../../services/schema.service';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent implements OnInit {
  slug = '';

  constructor(
    private route: ActivatedRoute,
    private seo: SeoService,
    private schema: SchemaService,
    private analytics: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.slug = this.route.snapshot.params['slug'] || '';
    // TODO: Load product from ProductService by slug
    // then call seo.updateMetaTags() with real product data
    // and schema.addSchema(schema.getProductSchema({...}))
    // and analytics.trackProductView({...})
    this.seo.setPageSEO('shop');
  }
}
