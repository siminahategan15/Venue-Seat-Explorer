import { Component, Input, OnInit } from '@angular/core';
import { VenueService } from 'src/app/services/venue.service';
import { ReviewService } from 'src/app/services/review.service';
import { MediaService } from 'src/app/services/media.service';
import { SeatService } from 'src/app/services/seat.service';
import { SectionService } from 'src/app/services/section.service';
import { Seat, Section } from 'src/app/models';

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
  sections: Section[] = [];
  seatFilterSection: string | null = null;
  editingSeatId: string | null = null;
  editSeatData: Partial<Seat> = {};
  isAdmin = true;

  constructor(
    private venueService: VenueService,
    private seatService: SeatService,
    private sectionService: SectionService,
    private reviewService: ReviewService,
    private mediaService: MediaService,
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadFlaggedContent();
    this.loadSections();
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

  loadSections(): void {
    this.sectionService.getSectionsByVenue(this.venueId).subscribe({
      next: (sections) => {
        this.sections = sections;
      },
    });
  }

  get filteredSeats(): Seat[] {
    if (!this.seatFilterSection) return this.seats;
    return this.seats.filter((s) => {
      const sid = (s as any).sectionId?._id || s.sectionId;
      return sid === this.seatFilterSection;
    });
  }

  getSectionName(sectionId: string): string {
    const section = this.sections.find((s) => s._id === sectionId);
    return section ? section.name : '';
  }

  startEditSeat(seat: Seat): void {
    this.editingSeatId = seat._id;
    this.editSeatData = {
      seatNumber: seat.seatNumber,
      row: seat.row,
      sectionId: (seat as any).sectionId?._id || seat.sectionId,
    };
  }

  saveEditSeat(seatId: string): void {
    this.seatService.updateSeat(seatId, this.editSeatData).subscribe({
      next: (updated) => {
        const idx = this.seats.findIndex((s) => s._id === seatId);
        if (idx !== -1) this.seats[idx] = updated;
        this.editingSeatId = null;
      },
      error: (err) => {
        console.error('Failed to update seat:', err);
      },
    });
  }

  deleteSeat(seatId: string): void {
    if (!confirm('Delete this seat?')) return;
    this.seatService.deleteSeat(seatId).subscribe({
      next: () => {
        this.seats = this.seats.filter((s) => s._id !== seatId);
      },
      error: (err) => {
        console.error('Failed to delete seat:', err);
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
