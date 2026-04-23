import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { FieldsComponent } from './pages/fields/fields.component';
import { FieldDetailComponent } from './pages/field-detail/field-detail.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { AdminComponent } from './pages/admin/admin.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'fields', component: FieldsComponent },
      { path: 'fields/:id', component: FieldDetailComponent },
      { path: 'reservations', component: ReservationsComponent },
      { path: 'admin', component: AdminComponent },
    ]
  },
  { path: '**', redirectTo: 'login' }
];