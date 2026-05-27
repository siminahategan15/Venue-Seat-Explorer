import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReviewService } from 'src/app/services/review.service';
import { MediaService } from 'src/app/services/media.service';
import { SeatService } from 'src/app/services/seat.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-reviews-and-media',
  templateUrl: './reviews-and-media.component.html',
  styleUrls: ['./reviews-and-media.component.css'],
})
export class ReviewsAndMediaComponent implements OnInit {
  @Input() venueId!: string;
  @Input() isAdmin = false;
  @Input() currentUserId: string | null = '';

  reviews: any[] = [];
  mediaItems: any[] = [];
  seats: any[] = [];
  reviewForm!: FormGroup;
  activeTab = 0;
  loading = false;
  reviewError = '';
  showReviewForm = false;

  filterSeatId = '';
  filteredPhotos: any[] = [];

  constructor(
    private reviewService: ReviewService,
    private mediaService: MediaService,
    private seatService: SeatService,
    private fb: FormBuilder,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.initializeForm();
  }

  initializeForm(): void {
    this.reviewForm = this.fb.group({
      seatId: [null, Validators.required],
      ratingView: [5],
      ratingComfort: [5],
      ratingSound: [5],
      comment: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  loadData(): void {
    this.seatService.getSeatsByVenue(this.venueId).subscribe({
      next: (seats) => {
        this.seats = seats;
      },
    });

    this.reviewService.getReviewsByVenue(this.venueId).subscribe({
      next: (reviews) => {
        this.reviews = reviews.filter((r: any) => !r.isDeleted);
      },
    });

    this.mediaService.getMediaByVenue(this.venueId).subscribe({
      next: (media) => {
        this.mediaItems = media.filter((m: any) => !m.isDeleted);
        this.applyFilters();
      },
    });
  }

  applyFilters(): void {
    this.filteredPhotos = this.mediaItems.filter((photo) => {
      return !this.filterSeatId || photo.seatId?._id === this.filterSeatId;
    });
  }

  getSeatLabel(seat: any): string {
    if (!seat) return '';
    const section = seat.sectionId?.name || '';
    const prefix = section ? section + ' - ' : '';
    return `${prefix}Row ${seat.row}, Seat ${seat.seatNumber}`;
  }

  getReviewSeatLabel(review: any): string {
    if (review.seatId && typeof review.seatId === 'object') {
      return `Row ${review.seatId.row}, Seat ${review.seatId.seatNumber}`;
    }
    return '';
  }

  getPhotoSeatLabel(photo: any): string {
    if (photo.seatId && typeof photo.seatId === 'object') {
      return `Row ${photo.seatId.row}, Seat ${photo.seatId.seatNumber}`;
    }
    return '';
  }

  isLoggedIn(): boolean {
    return this.auth.currentUser !== null;
  }

  toggleReviewForm(): void {
    this.showReviewForm = !this.showReviewForm;
    this.reviewError = '';
  }

  onSubmitReview(): void {
    this.reviewForm.markAllAsTouched();
    if (this.reviewForm.invalid) return;

    this.loading = true;
    this.reviewError = '';

    const reviewData = {
      ...this.reviewForm.value,
      venueId: this.venueId,
    };

    this.reviewService.createReview(reviewData).subscribe({
      next: (review) => {
        this.reviews.unshift(review);
        this.reviewForm.reset({ ratingView: 5, ratingComfort: 5, ratingSound: 5 });
        this.showReviewForm = false;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to create review:', err);
        this.reviewError =
          err.error?.message || 'Failed to submit review. Please try again.';
        this.loading = false;
      },
    });
  }

  flagReview(reviewId: string): void {
    const reason = prompt('Reason for flagging this review:');
    if (!reason) return;
    this.reviewService.flagReview(reviewId, reason).subscribe({
      next: () => {
        const review = this.reviews.find((r) => r._id === reviewId);
        if (review) review.isFlagged = true;
      },
    });
  }

  getAverageRating(field: string): number {
    const rated = this.reviews.filter((r) => r[field] != null);
    if (rated.length === 0) return 0;
    const sum = rated.reduce((acc: number, r: any) => acc + (r[field] || 0), 0);
    return Math.round((sum / rated.length) * 10) / 10;
  }
}
