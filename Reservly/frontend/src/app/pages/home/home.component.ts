import { Component, OnInit, AfterViewInit, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FieldService } from '../../services/field.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChildren('animCard') animCards!: QueryList<ElementRef>;

  featuredFields: any[] = [];
  counters = { fields: 0, reservations: 0, users: 0 };

  typeEmojis: Record<string, string> = {
    football: '⚽',
    basketball: '🏀',
    tennis: '🎾',
    volleyball: '🏐',
    other: '🏟️'
  };

  steps = [
    { number: '1', title: 'Znajdź boisko', desc: 'Przeglądaj dostępne boiska sportowe w Twojej okolicy', icon: '🔍' },
    { number: '2', title: 'Wybierz termin', desc: 'Zarezerwuj dogodną godzinę w kalendarzu', icon: '📅' },
    { number: '3', title: 'Graj!', desc: 'Ciesz się grą na najlepszych obiektach', icon: '🏆' }
  ];

  features = [
    { icon: '⚡', title: 'Szybka rezerwacja', desc: 'Zarezerwuj boisko w mniej niż 60 sekund' },
    { icon: '🔒', title: 'Bezpieczne płatności', desc: 'Twoje dane są zawsze bezpieczne' },
    { icon: '📱', title: 'Zawsze dostępne', desc: 'Rezerwuj 24/7 z każdego urządzenia' },
    { icon: '⭐', title: 'Sprawdzone obiekty', desc: 'Tylko zweryfikowane boiska sportowe' }
  ];

  constructor(private fieldService: FieldService) {}

  ngOnInit(): void {
    this.fieldService.getAllFields().subscribe({
      next: (data) => {
        this.featuredFields = data.slice(0, 4);
        this.animateCounters();
      },
      error: () => {}
    });
  }

  ngAfterViewInit(): void {
    this.setupScrollAnimations();
  }

  animateCounters(): void {
    const targets = { fields: 10, reservations: 25, users: 15 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);

      this.counters.fields = Math.round(targets.fields * ease);
      this.counters.reservations = Math.round(targets.reservations * ease);
      this.counters.users = Math.round(targets.users * ease);

      if (step >= steps) clearInterval(timer);
    }, interval);
  }

  setupScrollAnimations(): void {
  setTimeout(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  }, 100);
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
