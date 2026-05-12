import { Component, Input, OnInit } from '@angular/core';
import { VenueService } from 'src/app/services/venue.service';
import { ReviewService } from 'src/app/services/review.service';
import { MediaService } from 'src/app/services/media.service';
import { SeatService } from 'src/app/services/seat.service';
import { Seat } from 'src/app/models';

@Component({
  selector: 'app-venue-admin-dashboard',
  templateUrl: './venue-admin-dashboard.component.html',
  styleUrls: ['./venue-admin-dashboard.component.css'],
})
export class VenueAdminDashboardComponent implements OnInit {
  @Input() venueId!: string;

  stats: any;
  flaggedReviews: any[] = [];
  flaggedPhotos: any[] = [];
  seats: Seat[] = [];
  newSeat: Partial<Seat> = { section: '', row: '', seatNumber: '' };
  isAdmin: boolean = true;

  constructor(
    private venueService: VenueService,
    private seatService: SeatService,
    private reviewService: ReviewService,
    private mediaService: MediaService,
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadFlaggedContent();
    this.loadSeats();
  }

  loadStats(): void {
    this.venueService.getVenueAdminStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
    });
  }

  loadFlaggedContent(): void {
    this.reviewService.getFlaggedReviews(this.venueId).subscribe({
      next: (reviews) => {
        this.flaggedReviews = reviews;
      },
    });

    this.mediaService.getFlaggedMedia(this.venueId).subscribe({
      next: (photos) => {
        this.flaggedPhotos = photos;
      },
    });
  }

  loadSeats(): void {
    this.seatService.getSeatsByVenue(this.venueId).subscribe({
      next: (seats) => {
        this.seats = seats;
      },
      error: (err) => {
        console.error('Failed to load seats:', err);
      },
    });
  }

  onAddSeat(): void {
    const seatData: Partial<Seat> = {
      ...this.newSeat,
      venueId: this.venueId,
    };

    this.seatService.createSeat(seatData).subscribe({
      next: (seat) => {
        console.log('Seat added:', seat);
        this.seats.push(seat);
        this.newSeat = { section: '', row: '', seatNumber: '' };
      },
      error: (err) => {
        console.error('Failed to add seat:', err);
      },
    });
  }

  deleteMedia(media: any): void {
    this.mediaService.deleteMedia(media.mediaId, media).subscribe({
      next: () => {
        this.flaggedPhotos = this.flaggedPhotos.filter(
          (photo) => photo._id !== media.mediaId,
        );
      },
      error: (err) => {
        console.error('Failed to delete media:', err);
      },
    });
  }

  deleteReview(review: any): void {
    this.reviewService.deleteReview(review._id).subscribe({
      next: () => {
        this.flaggedReviews = this.flaggedReviews.filter(
          (r) => r._id !== review._id,
        );
      },
      error: (err) => {
        console.error('Failed to delete review:', err);
      },
    });
  }

  censorReview(review: any, flagReason: string): void {
    this.reviewService
      .censorReview(review._id, { reason: flagReason })
      .subscribe({
        next: () => {
          this.flaggedReviews = this.flaggedReviews.filter(
            (r) => r._id !== review._id,
          );
        },
        error: (err) => {
          console.error('Failed to censor review:', err);
        },
      });
  }
}
