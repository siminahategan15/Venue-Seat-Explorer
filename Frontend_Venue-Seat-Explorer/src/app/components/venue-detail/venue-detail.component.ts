import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VenueService } from '../../services/venue.service';
import { SeatService } from '../../services/seat.service';
import { Venue, Seat } from '../../models';

@Component({
  selector: 'app-venue-detail',
  templateUrl: './venue-detail.component.html',
  styleUrls: ['./venue-detail.component.css'],
})
export class VenueDetailComponent implements OnInit {
  venue: Venue | null = null;
  seats: Seat[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private venueService: VenueService,
    private seatService: SeatService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadVenue(id);
      this.loadSeats(id);
    }
  }

  loadVenue(id: string): void {
    this.venueService.getVenueById(id).subscribe({
      next: (data) => {
        this.venue = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadSeats(venueId: string): void {
    this.seatService.getSeatsByVenue(venueId).subscribe({
      next: (data) => {
        this.seats = data;
      },
    });
  }
}
