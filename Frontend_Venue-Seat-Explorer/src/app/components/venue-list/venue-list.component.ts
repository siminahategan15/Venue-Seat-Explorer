import { Component, OnInit } from '@angular/core';
import { VenueService } from '../../services/venue.service';
import { User, Venue } from '../../models';
import { AppUser, AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-venue-list',
  templateUrl: './venue-list.component.html',
  styleUrls: ['./venue-list.component.css'],
})
export class VenueListComponent implements OnInit {
  venues: Venue[] = [];
  loading = true;
  user: User | null = null;

  constructor(
    private venueService: VenueService,
    public auth: AuthService,
    public router: Router,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.loadVenues();
    this.auth.getCurrentUserMongoDB().subscribe((user) => {
      if (user) {
        this.user = user;
      }
    });
  }

  loadVenues(): void {
    this.venueService.getAllVenues().subscribe({
      next: (data) => {
        this.venues = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  isUserAdmin(): boolean {
    return this.user?.role === 'admin';
  }
}
