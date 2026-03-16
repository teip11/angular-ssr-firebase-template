import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../services/seo.service';
@Component({ selector: 'app-blog', standalone: true, imports: [CommonModule, RouterModule],
  templateUrl: './blog.component.html', styleUrl: './blog.component.css' })
export class BlogComponent implements OnInit {
  // TODO: Replace with real posts from a BlogService / CMS / markdown files
  posts = [
    { slug: 'korean-skincare-routine', title: '10-Step Korean Skincare Routine: Complete Guide', excerpt: 'Learn the iconic 10-step K-beauty routine and how to customize it for your skin type.', category: 'Skincare', date: 'March 10, 2026' },
    { slug: 'best-korean-serums', title: 'Best Korean Serums for Glowing Skin in 2026', excerpt: 'Our top picks for serums that deliver real results, from glass skin to anti-aging.', category: 'Products', date: 'March 5, 2026' },
    { slug: 'k-beauty-for-sensitive-skin', title: 'K-Beauty for Sensitive Skin: Gentle Picks', excerpt: 'Discover the most gentle Korean skincare picks for sensitive and reactive skin types.', category: 'Sensitive Skin', date: 'February 28, 2026' },
  ];
  constructor(private seo: SeoService) {}
  ngOnInit(): void { this.seo.setPageSEO('blog'); }
}
