import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FieldService } from '../../services/field.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-fields',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './fields.component.html',
  styleUrl: './fields.component.scss'
})
export class FieldsComponent implements OnInit {
  fields: any[] = [];
  filteredFields: any[] = [];
  pagedFields: any[] = [];

  loading = true;
  error = '';
  selectedType = '';
  searchQuery = '';

  // Pagination
  readonly PAGE_SIZE = 8;
  currentPage = 1;
  totalPages = 1;
  pageNumbers: number[] = [];

  typeOptions = [
    { value: '', label: 'Wszystkie' },
    { value: 'football', label: '⚽ Football' },
    { value: 'basketball', label: '🏀 Basketball' },
    { value: 'tennis', label: '🎾 Tennis' },
    { value: 'volleyball', label: '🏐 Volleyball' }
  ];

  typeEmojis: Record<string, string> = {
    football: '⚽',
    basketball: '🏀',
    tennis: '🎾',
    volleyball: '🏐',
    other: '🏟️'
  };

  constructor(
    private fieldService: FieldService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFields();
  }

  loadFields(): void {
    this.loading = true;
    this.error = '';
    this.fieldService.getAllFields().subscribe({
      next: (data) => {
        this.fields = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'Błąd pobierania boisk';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let result = [...this.fields];

    if (this.selectedType) {
      result = result.filter(f => f.type === this.selectedType);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(f =>
        f.name?.toLowerCase().includes(q) ||
        f.location?.toLowerCase().includes(q)
      );
    }

    this.filteredFields = result;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredFields.length / this.PAGE_SIZE));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.buildPageNumbers();
    this.slicePage();
  }

  slicePage(): void {
    const start = (this.currentPage - 1) * this.PAGE_SIZE;
    this.pagedFields = this.filteredFields.slice(start, start + this.PAGE_SIZE);
  }

  buildPageNumbers(): void {
    const total = this.totalPages;
    const cur = this.currentPage;

    if (total <= 7) {
      this.pageNumbers = Array.from({ length: total }, (_, i) => i + 1);
      return;
    }

    const pages: number[] = [1];

    if (cur > 3) pages.push(-1); // ellipsis

    for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) {
      pages.push(p);
    }

    if (cur < total - 2) pages.push(-1); // ellipsis

    pages.push(total);
    this.pageNumbers = pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.buildPageNumbers();
    this.slicePage();
    // Smooth scroll to top of grid
    window.scrollTo({ top: 200, behavior: 'smooth' });
  }

  setType(type: string): void {
    this.selectedType = type;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  getEmoji(type: string): string {
    return this.typeEmojis[type] || '🏟️';
  }

  getFieldImage(type: string): string {
    const images: Record<string, string> = {
      football: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&q=80',
      basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80',
      tennis: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&q=80',
      volleyball: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&q=80',
      other: 'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?w=400&q=80'
    };
    return images[type] || images['other'];
  }
}