import { Component, OnInit } from '@angular/core';
import { VenueService } from '../../services/venue.service';
import { Venue } from '../../models';

@Component({
  selector: 'app-venue-list',
  templateUrl: './venue-list.component.html',
  styleUrls: ['./venue-list.component.css'],
})
export class VenueListComponent implements OnInit {
  venues: Venue[] = [];
  loading = true;

  constructor(private venueService: VenueService) {}

  ngOnInit(): void {
    this.loadVenues();
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
}
