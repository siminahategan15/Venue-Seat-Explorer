import { Component, OnInit } from '@angular/core';
import { VenueService } from '../../services/venue.service';
import { User, Venue } from '../../models';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { SearchService } from 'src/app/services/search.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-venue-list',
  templateUrl: './venue-list.component.html',
  styleUrls: ['./venue-list.component.css'],
})
export class VenueListComponent implements OnInit {
  venues: Venue[] = [];
  allVenues: Venue[] = [];
  loading = true;
  user: User | null = null;
  searchQuery = '';
  private searchSubject = new Subject<string>();

  constructor(
    private venueService: VenueService,
    public auth: AuthService,
    public router: Router,
    private userService: UserService,
    private searchService: SearchService,
  ) {}

  ngOnInit(): void {
    this.loadVenues();
    this.auth.getCurrentUserMongoDB().subscribe((user) => {
      if (user) {
        this.user = user;
      }
    });

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((query) => {
        if (!query.trim()) {
          this.venues = this.allVenues;
          return;
        }
        this.searchService.searchVenues(query).subscribe({
          next: (results) => {
            this.venues = results;
          },
        });
      });
  }

  loadVenues(): void {
    this.venueService.getAllVenues().subscribe({
      next: (data) => {
        this.venues = data;
        this.allVenues = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.venues = this.allVenues;
  }

  isUserAdmin(): boolean {
    return this.user?.role === 'admin';
  }
}
