import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { FieldService } from '../../services/field.service';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  fields: any[] = [];
  reservations: any[] = [];
  loadingFields = true;
  loadingReservations = true;

  showFieldForm = false;
  editingField: any = null;
  fieldForm: FormGroup;

  fieldColumns = ['name', 'type', 'location', 'price', 'actions'];
  reservationColumns = ['field', 'user', 'date', 'time', 'status', 'actions'];

  typeOptions = [
    { value: 'football', label: '⚽ Football' },
    { value: 'basketball', label: '🏀 Basketball' },
    { value: 'tennis', label: '🎾 Tennis' },
    { value: 'volleyball', label: '🏐 Volleyball' },
    { value: 'other', label: '🏟️ Other' }
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
    private reservationService: ReservationService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.fieldForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      location: ['', Validators.required],
      pricePerHour: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadFields();
    this.loadReservations();
  }

  loadFields(): void {
    this.loadingFields = true;
    this.fieldService.getAllFields().subscribe({
      next: (data) => {
        this.fields = data;
        this.loadingFields = false;
      },
      error: () => this.loadingFields = false
    });
  }

  loadReservations(): void {
    this.loadingReservations = true;
    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.loadingReservations = false;
      },
      error: () => this.loadingReservations = false
    });
  }

  openAddForm(): void {
    this.editingField = null;
    this.fieldForm.reset();
    this.showFieldForm = true;
  }

  openEditForm(field: any): void {
    this.editingField = field;
    this.fieldForm.patchValue({
      name: field.name,
      type: field.type,
      location: field.location,
      pricePerHour: field.pricePerHour
    });
    this.showFieldForm = true;
  }

  closeForm(): void {
    this.showFieldForm = false;
    this.editingField = null;
    this.fieldForm.reset();
  }

  saveField(): void {
    if (this.fieldForm.invalid) return;

    if (this.editingField) {
      this.fieldService.updateField(this.editingField._id, this.fieldForm.value).subscribe({
        next: () => {
          this.snackBar.open('Boisko zaktualizowane ✅', 'OK', { duration: 3000 });
          this.closeForm();
          this.loadFields();
        },
        error: (err) => this.snackBar.open(err.error?.message || 'Błąd', 'OK', { duration: 3000 })
      });
    } else {
      this.fieldService.createField(this.fieldForm.value).subscribe({
        next: () => {
          this.snackBar.open('Boisko dodane ✅', 'OK', { duration: 3000 });
          this.closeForm();
          this.loadFields();
        },
        error: (err) => this.snackBar.open(err.error?.message || 'Błąd', 'OK', { duration: 3000 })
      });
    }
  }

  deleteField(id: string): void {
    if (!confirm('Czy na pewno chcesz usunąć to boisko?')) return;
    this.fieldService.deleteField(id).subscribe({
      next: () => {
        this.snackBar.open('Boisko usunięte ✅', 'OK', { duration: 3000 });
        this.loadFields();
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Błąd', 'OK', { duration: 3000 })
    });
  }

  cancelReservation(id: string): void {
    if (!confirm('Czy na pewno chcesz anulować tę rezerwację?')) return;
    this.reservationService.cancelReservation(id).subscribe({
      next: () => {
        this.snackBar.open('Rezerwacja anulowana ✅', 'OK', { duration: 3000 });
        this.loadReservations();
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Błąd', 'OK', { duration: 3000 })
    });
  }

  getStatusColor(status: string): string {
    if (status === 'confirmed') return 'confirmed';
    if (status === 'cancelled') return 'cancelled';
    return 'pending';
  }

  getEmoji(type: string): string {
    return this.typeEmojis[type] || '🏟️';
  }
}