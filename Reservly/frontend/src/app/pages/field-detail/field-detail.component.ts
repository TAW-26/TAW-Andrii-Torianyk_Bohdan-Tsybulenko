import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { FieldService } from '../../services/field.service';
import { ReservationService } from '../../services/reservation.service';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-field-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatSnackBarModule
  ],
  templateUrl: './field-detail.component.html',
  styleUrl: './field-detail.component.scss'
})
export class FieldDetailComponent implements OnInit {
  field: any = null;
  reviews: any[] = [];
  availability: any[] = [];
  loading = true;
  error = '';

  selectedDate: Date = new Date();
  selectedStartTime = '';
  selectedEndTime = '';
  reservationLoading = false;
  reservationSuccess = false;

  today = new Date();

  timeSlots = [
    '8:00', '9:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00'
  ];

  typeEmojis: Record<string, string> = {
    football: '⚽',
    basketball: '🏀',
    tennis: '🎾',
    volleyball: '🏐',
    other: '🏟️'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fieldService: FieldService,
    private reservationService: ReservationService,
    private reviewService: ReviewService,
    public auth: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.fieldService.getFieldById(id).subscribe({
      next: (data) => {
        this.field = data;
        this.loading = false;
        this.loadReviews(id);
        this.loadAvailability();
      },
      error: () => {
        this.error = 'Nie znaleziono boiska';
        this.loading = false;
      }
    });
  }

  loadReviews(fieldId: string): void {
    this.reviewService.getFieldReviews(fieldId).subscribe({
      next: (data) => this.reviews = data,
      error: () => {}
    });
  }

  loadAvailability(): void {
    if (!this.field) return;
    const dateStr = this.selectedDate.toISOString().split('T')[0];
    this.reservationService.getFieldAvailability(this.field._id, dateStr).subscribe({
      next: (data) => this.availability = data,
      error: () => {}
    });
  }

  onNativeDateChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    if (val) {
      this.selectedDate = new Date(val + 'T00:00:00');
      this.selectedStartTime = '';
      this.selectedEndTime = '';
      this.loadAvailability();
    }
  }

  onDateChange(): void {
    this.selectedStartTime = '';
    this.selectedEndTime = '';
    this.loadAvailability();
  }

  isSlotTaken(slot: string): boolean {
    const slotMinutes = this.timeToMinutes(slot);
    return this.availability.some(r => {
      const start = this.timeToMinutes(r.startTime);
      const end = this.timeToMinutes(r.endTime);
      return slotMinutes >= start && slotMinutes < end;
    });
  }

  selectSlot(slot: string): void {
    if (this.isSlotTaken(slot)) return;
    this.selectedStartTime = slot;
    const index = this.timeSlots.indexOf(slot);
    this.selectedEndTime = this.timeSlots[index + 1] || '';
  }

  timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + (m || 0);
  }

  getStars(rating: number): string {
    return '★'.repeat(Math.max(0, Math.min(5, rating))) + '☆'.repeat(5 - Math.max(0, Math.min(5, rating)));
  }

  getFieldImage(type: string): string {
    const images: Record<string, string> = {
      football: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80',
      basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
      tennis: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
      volleyball: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
      other: 'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?w=800&q=80'
    };
    return images[type] || images['other'];
  }

  reserve(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    if (!this.selectedStartTime || !this.selectedEndTime) return;

    this.reservationLoading = true;
    const dateStr = this.selectedDate.toISOString().split('T')[0];

    this.reservationService.createReservation({
      fieldId: this.field._id,
      date: dateStr,
      startTime: this.selectedStartTime,
      endTime: this.selectedEndTime
    }).subscribe({
      next: () => {
        this.reservationLoading = false;
        this.reservationSuccess = true;
        this.selectedStartTime = '';
        this.selectedEndTime = '';
        this.loadAvailability();
        this.snackBar.open('Rezerwacja udana! ✅', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.reservationLoading = false;
        this.snackBar.open(err.error?.message || 'Błąd rezerwacji', 'OK', { duration: 3000 });
      }
    });
  }
}