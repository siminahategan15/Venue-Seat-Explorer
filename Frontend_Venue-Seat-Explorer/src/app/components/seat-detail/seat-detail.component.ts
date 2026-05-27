import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SeatService } from '../../services/seat.service';
import { ReviewService } from '../../services/review.service';
import { MediaService } from '../../services/media.service';
import { AuthService } from '../../services/auth.service';
import { Seat, Review, Media } from '../../models';

@Component({
  selector: 'app-seat-detail',
  templateUrl: './seat-detail.component.html',
  styleUrls: ['./seat-detail.component.css'],
})
export class SeatDetailComponent implements OnInit {
  @Input() seatId!: string;
  seat: Seat | null = null;
  reviews: Review[] = [];
  media: Media[] = [];
  loading = true;

  showReviewForm = false;
  ratingView = 5;
  ratingComfort = 5;
  ratingSound = 5;
  comment = '';
  submittingReview = false;
  reviewError = '';

  showUploadForm = false;
  selectedFile: File | null = null;
  caption = '';
  uploading = false;

  constructor(
    private route: ActivatedRoute,
    private seatService: SeatService,
    private reviewService: ReviewService,
    private mediaService: MediaService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    const id = this.seatId || this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSeat(id);
      this.loadReviews(id);
      this.loadMedia(id);
    }
  }

  private getVenueId(): string {
    if (!this.seat) return '';
    const venueId = this.seat.venueId;
    return typeof venueId === 'object' ? (venueId as any)._id : venueId;
  }

  loadSeat(id: string): void {
    this.seatService.getSeatById(id).subscribe({
      next: (data) => {
        this.seat = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading seat:', err);
        this.loading = false;
      },
    });
  }

  loadReviews(seatId: string): void {
    this.reviewService.getReviewsBySeat(seatId).subscribe({
      next: (data) => {
        this.reviews = data;
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
      },
    });
  }

  loadMedia(seatId: string): void {
    this.mediaService.getMediaBySeat(seatId).subscribe({
      next: (data) => {
        this.media = data;
      },
      error: (err) => {
        console.error('Error loading media:', err);
      },
    });
  }

  isUserLoggedIn(): boolean {
    return this.auth.currentUser !== null;
  }

  getAverageRating(field: 'ratingView' | 'ratingComfort' | 'ratingSound'): number {
    const rated = this.reviews.filter((r) => r[field] != null);
    if (rated.length === 0) return 0;
    const sum = rated.reduce((acc, r) => acc + (r[field] || 0), 0);
    return Math.round((sum / rated.length) * 10) / 10;
  }

  toggleReviewForm(): void {
    this.showReviewForm = !this.showReviewForm;
    this.reviewError = '';
  }

  submitReview(): void {
    if (!this.seat || !this.isUserLoggedIn()) {
      return;
    }

    this.submittingReview = true;
    this.reviewError = '';

    const review: Partial<Review> = {
      seatId: this.seat._id,
      venueId: this.getVenueId(),
      ratingView: this.ratingView,
      ratingComfort: this.ratingComfort,
      ratingSound: this.ratingSound,
      comment: this.comment,
    };

    this.reviewService.createReview(review).subscribe({
      next: (newReview) => {
        this.reviews.unshift(newReview);
        this.resetReviewForm();
        this.submittingReview = false;
      },
      error: (err) => {
        console.error('Error creating review:', err);
        this.reviewError =
          err.error?.message || 'Failed to submit review. Please try again.';
        this.submittingReview = false;
      },
    });
  }

  resetReviewForm(): void {
    this.ratingView = 5;
    this.ratingComfort = 5;
    this.ratingSound = 5;
    this.comment = '';
    this.showReviewForm = false;
    this.reviewError = '';
  }

  toggleUploadForm(): void {
    this.showUploadForm = !this.showUploadForm;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadPhoto(): void {
    if (!this.selectedFile || !this.seat || !this.isUserLoggedIn()) {
      return;
    }

    this.uploading = true;
    this.mediaService
      .uploadMedia(this.seat._id, this.selectedFile, this.caption, this.getVenueId())
      .subscribe({
        next: (newMedia) => {
          this.media.unshift(newMedia);
          this.resetUploadForm();
          this.uploading = false;
        },
        error: (err) => {
          console.error('Error uploading photo:', err);
          this.uploading = false;
        },
      });
  }

  resetUploadForm(): void {
    this.selectedFile = null;
    this.caption = '';
    this.showUploadForm = false;
  }

  deleteReview(reviewId: string): void {
    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.reviews = this.reviews.filter((r) => r._id !== reviewId);
      },
      error: (err) => {
        console.error('Error deleting review:', err);
      },
    });
  }

  deleteMedia(mediaId: string): void {
    this.mediaService
      .deleteMedia(mediaId, { reason: 'User deleted' })
      .subscribe({
        next: () => {
          this.media = this.media.filter((m) => m._id !== mediaId);
        },
        error: (err) => {
          console.error('Error deleting media:', err);
        },
      });
  }
}
