import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VenueListComponent } from './components/venue-list/venue-list.component';
import { VenueDetailComponent } from './components/venue-detail/venue-detail.component';
import { SeatDetailComponent } from './components/seat-detail/seat-detail.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

const routes: Routes = [
  { path: '', component: VenueListComponent },
  { path: 'venues/:id', component: VenueDetailComponent },
  { path: 'seats/:id', component: SeatDetailComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
