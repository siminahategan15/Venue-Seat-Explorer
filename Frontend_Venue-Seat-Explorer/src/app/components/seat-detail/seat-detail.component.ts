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
  comment = '';
  submittingReview = false;

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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSeat(id);
      this.loadReviews(id);
      this.loadMedia(id);
    }
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

  toggleReviewForm(): void {
    this.showReviewForm = !this.showReviewForm;
  }

  submitReview(): void {
    if (!this.seat || !this.isUserLoggedIn()) {
      return;
    }

    this.submittingReview = true;
    const review: Partial<Review> = {
      seatId: this.seat._id,
      ratingView: this.ratingView,
      ratingComfort: this.ratingComfort,
      comment: this.comment,
    };

    this.reviewService.createReview(review).subscribe({
      next: (newReview) => {
        this.reviews.push(newReview);
        this.resetReviewForm();
        this.submittingReview = false;
      },
      error: (err) => {
        console.error('Error creating review:', err);
        this.submittingReview = false;
      },
    });
  }

  resetReviewForm(): void {
    this.ratingView = 5;
    this.ratingComfort = 5;
    this.comment = '';
    this.showReviewForm = false;
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
      .uploadMedia(this.seat._id, this.selectedFile, this.caption)
      .subscribe({
        next: (newMedia) => {
          this.media.push(newMedia);
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
