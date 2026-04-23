import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReservationService } from '../../services/reservation.service';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatSnackBarModule
  ],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss'
})
export class ReservationsComponent implements OnInit {
  reservations: any[] = [];
  loading = true;
  error = '';
  activeTab: 'active' | 'cancelled' = 'active';

  hoverRating = 0;
  reviewModal: {
    open: boolean;
    reservation: any;
    rating: number;
    comment: string;
    loading: boolean;
  } = {
    open: false,
    reservation: null,
    rating: 0,
    comment: '',
    loading: false
  };

  typeEmojis: Record<string, string> = {
    football: '⚽',
    basketball: '🏀',
    tennis: '🎾',
    volleyball: '🏐',
    other: '🏟️'
  };

  ratingLabels = ['', 'Słabo', 'Poniżej oczekiwań', 'Nieźle', 'Polecam!', 'Wyśmienite!'];

  constructor(
    private reservationService: ReservationService,
    private reviewService: ReviewService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    this.reservationService.getMyReservations().subscribe({
      next: (data) => { this.reservations = data; this.loading = false; },
      error: () => { this.error = 'Błąd pobierania rezerwacji'; this.loading = false; }
    });
  }

  getActive(): any[] {
    return this.reservations.filter(r => r.status !== 'cancelled');
  }

  getCancelled(): any[] {
    return this.reservations.filter(r => r.status === 'cancelled');
  }

  cancel(id: string): void {
    this.reservationService.cancelReservation(id).subscribe({
      next: () => {
        this.snackBar.open('Rezerwacja anulowana ✅', 'OK', { duration: 3000 });
        this.loadReservations();
      },
      error: (err: any) => {
        this.snackBar.open(err.error?.message || 'Błąd anulowania', 'OK', { duration: 3000 });
      }
    });
  }

  isPast(dateStr: string): boolean {
    return new Date(dateStr) < new Date(new Date().toDateString());
  }

  openReview(reservation: any): void {
    this.reviewModal = { open: true, reservation, rating: 0, comment: '', loading: false };
    this.hoverRating = 0;
    document.body.style.overflow = 'hidden';
  }

  closeReview(): void {
    this.reviewModal.open = false;
    document.body.style.overflow = '';
  }

  setRating(n: number): void {
    this.reviewModal.rating = n;
  }

  getRatingLabel(n: number): string {
    return this.ratingLabels[n] || '';
  }

  submitReview(): void {
    if (!this.reviewModal.rating) return;
    this.reviewModal.loading = true;

    this.reviewService.createReview({
      fieldId: this.reviewModal.reservation.field._id,
      rating: this.reviewModal.rating,
      comment: this.reviewModal.comment.trim()
    }).subscribe({
      next: () => {
        this.reviewModal.loading = false;
        this.closeReview();
        this.snackBar.open('Opinia została dodana! ⭐', 'OK', { duration: 3000 });
      },
      error: (err: any) => {
        this.reviewModal.loading = false;
        this.snackBar.open(err.error?.message || 'Błąd dodawania opinii', 'OK', { duration: 3000 });
      }
    });
  }

  getStatusColor(status: string): string {
    if (status === 'confirmed') return 'confirmed';
    if (status === 'cancelled') return 'cancelled';
    return 'pending';
  }

  getStatusLabel(status: string): string {
    if (status === 'confirmed') return 'Potwierdzona';
    if (status === 'cancelled') return 'Anulowana';
    return 'Oczekuje';
  }

  getEmoji(type: string): string {
    return this.typeEmojis[type] || '🏟️';
  }

  getFieldImage(type: string): string {
    const images: Record<string, string> = {
      football:   'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&q=80',
      basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80',
      tennis:     'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80',
      volleyball: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600&q=80',
      other:      'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?w=600&q=80'
    };
    return images[type] || images['other'];
  }
}