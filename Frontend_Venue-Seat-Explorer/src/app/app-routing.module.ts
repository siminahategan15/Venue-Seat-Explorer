import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VenueListComponent } from './components/venue-list/venue-list.component';
import { VenueDetailComponent } from './components/venue-detail/venue-detail.component';
import { SeatDetailComponent } from './components/seat-detail/seat-detail.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './guards/auth-guard.guard';
import { CreateVenueComponent } from './components/create-venue/create-venue.component';

const routes: Routes = [
  {
    path: 'venues/create',
    component: CreateVenueComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'login',

    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  { path: '', component: VenueListComponent, canActivate: [AuthGuard] },
  {
    path: 'venues/:id',
    component: VenueDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'seats/:id',
    component: SeatDetailComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
