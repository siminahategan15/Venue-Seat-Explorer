import { Component, Input, OnInit } from '@angular/core';
import { SeatService } from 'src/app/services/seat.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-seat-list',
  templateUrl: './seat-list.component.html',
  styleUrls: ['./seat-list.component.css'],
})
export class SeatListComponent implements OnInit {
  @Input() venueId!: string;
  @Input() isAdmin = false;

  seats: any[] = [];
  selectedSeat: any = null;
  showCreateForm = false;
  createSeatForm!: FormGroup;
  loading = false;

  constructor(
    private seatService: SeatService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.loadSeats();
    this.initializeForm();
  }

  initializeForm(): void {
    this.createSeatForm = this.fb.group({
      seatNumber: ['', [Validators.required]],
      row: ['', [Validators.required]],
      section: ['', [Validators.required]],
      category: ['', [Validators.required]],
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

  onCreateSeat(): void {
    if (!this.createSeatForm.valid) return;

    this.loading = true;
    const seatData = {
      ...this.createSeatForm.value,
      venueId: this.venueId,
    };

    this.seatService.createSeat(seatData).subscribe({
      next: (seat) => {
        this.seats.push(seat);
        this.createSeatForm.reset();
        this.showCreateForm = false;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to create seat:', err);
        this.loading = false;
      },
    });
  }

  deleteSeat(seatId: string): void {
    if (confirm('Are you sure you want to delete this seat?')) {
      this.seatService.deleteSeat(seatId).subscribe({
        next: () => {
          this.seats = this.seats.filter((s) => s._id !== seatId);
        },
        error: (err) => {
          console.error('Failed to delete seat:', err);
        },
      });
    }
  }

  selectSeat(seat: any): void {
    this.selectedSeat = seat;
  }
}
