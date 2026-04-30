import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  isDark = true;
  isRotating = false; // Додано для анімації іконки

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('theme');
    this.isDark = saved !== 'light';
    this.applyTheme();
  }

  toggleTheme(): void {
    // Запускаємо анімацію
    this.isRotating = true;
    
    setTimeout(() => {
      // Змінюємо тему посеред анімації
      this.isDark = !this.isDark;
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
      this.applyTheme();
      
      // Завершуємо анімацію
      this.isRotating = false;
    }, 150);
  }

  private applyTheme(): void {
    document.body.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
  }

  getInitials(): string {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      return parsed.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U';
    }
    return 'U';
  }

  getUserName(): string {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      return parsed.name?.split(' ')[0] || '';
    }
    return '';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}