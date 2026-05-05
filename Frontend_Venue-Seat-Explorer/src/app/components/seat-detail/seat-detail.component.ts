import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SeatService } from '../../services/seat.service';
import { ReviewService } from '../../services/review.service';
import { MediaService } from '../../services/media.service';
import { Seat, Review, Media } from '../../models';

@Component({
  selector: 'app-seat-detail',
  templateUrl: './seat-detail.component.html',
  styleUrls: ['./seat-detail.component.css'],
})
export class SeatDetailComponent implements OnInit {
  seat: Seat | null = null;
  reviews: Review[] = [];
  media: Media[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private seatService: SeatService,
    private reviewService: ReviewService,
    private mediaService: MediaService
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
      error: () => {
        this.loading = false;
      },
    });
  }

  loadReviews(seatId: string): void {
    this.reviewService.getReviewsBySeat(seatId).subscribe({
      next: (data) => {
        this.reviews = data;
      },
    });
  }

  loadMedia(seatId: string): void {
    this.mediaService.getMediaBySeat(seatId).subscribe({
      next: (data) => {
        this.media = data;
      },
    });
  }
}
