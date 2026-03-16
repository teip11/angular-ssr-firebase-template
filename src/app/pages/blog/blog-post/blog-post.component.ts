import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { SeoService } from '../../../services/seo.service';
@Component({ selector: 'app-blog-post', standalone: true, imports: [CommonModule, RouterModule],
  templateUrl: './blog-post.component.html', styleUrl: './blog-post.component.css' })
export class BlogPostComponent implements OnInit {
  slug = '';
  constructor(private route: ActivatedRoute, private seo: SeoService) {}
  ngOnInit(): void {
    this.slug = this.route.snapshot.params['slug'] || '';
    // TODO: Load post content by slug from BlogService / CMS
    // then call seo.updateMetaTags({ title, description, ogImage })
    this.seo.setPageSEO('blog');
  }
}
