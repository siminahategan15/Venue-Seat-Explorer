import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReviewService } from 'src/app/services/review.service';
import { MediaService } from 'src/app/services/media.service';
import { SeatService } from 'src/app/services/seat.service';

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
  uploadedFiles: any[] = [];
  activeTab = 0;
  loading = false;
  filter = { seatId: '', date: '' };
  filteredPhotos: any[] = [];

  constructor(
    private reviewService: ReviewService,
    private mediaService: MediaService,
    private seatService: SeatService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.initializeForm();
  }

  initializeForm(): void {
    this.reviewForm = this.fb.group({
      seatId: ['', Validators.required],
      ratingView: [
        5,
        [Validators.required, Validators.min(1), Validators.max(5)],
      ],
      ratingComfort: [
        5,
        [Validators.required, Validators.min(1), Validators.max(5)],
      ],
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
        this.reviews = reviews.filter((r) => !r.isDeleted);
      },
    });

    this.mediaService.getMediaByVenue(this.venueId).subscribe({
      next: (media) => {
        this.mediaItems = media.filter((m) => !m.isDeleted);
        this.applyFilters();
      },
    });
  }

  applyFilters(): void {
    this.filteredPhotos = this.mediaItems.filter((photo) => {
      const matchesSeat =
        !this.filter.seatId || photo.seatId === this.filter.seatId;
      const matchesDate =
        !this.filter.date ||
        new Date(photo.createdAt).toDateString() ===
          new Date(this.filter.date).toDateString();
      return matchesSeat && matchesDate;
    });
  }

  onSubmitReview(): void {
    if (this.reviewForm.invalid) return;

    this.loading = true;
    const reviewData = {
      ...this.reviewForm.value,
      venueId: this.venueId,
    };

    this.reviewService.createReview(reviewData).subscribe({
      next: (review) => {
        this.reviews.push(review);

        if (this.uploadedFiles.length > 0) {
          this.uploadPhotos(review._id);
        }

        this.reviewForm.reset({ ratingView: 5, ratingComfort: 5 });
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to create review:', err);
        this.loading = false;
      },
    });
  }

  uploadPhotos(reviewId: string): void {
    for (let file of this.uploadedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('reviewId', reviewId);

      this.mediaService
        .uploadMedia(this.reviewForm.get('seatId')?.value, file)
        .subscribe({
          next: (media) => {
            this.mediaItems.push(media);
            this.applyFilters();
          },
          error: (err) => {
            console.error('Failed to upload media:', err);
          },
        });
    }
  }

  onUpload(event: any): void {
    this.uploadedFiles = event.files;
  }
}
