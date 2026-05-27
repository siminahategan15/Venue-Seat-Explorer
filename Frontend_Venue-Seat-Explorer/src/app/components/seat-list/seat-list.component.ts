import { Component, Input, OnInit } from '@angular/core';
import { SeatService } from 'src/app/services/seat.service';
import { SectionService } from 'src/app/services/section.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Section } from 'src/app/models';

@Component({
  selector: 'app-seat-list',
  templateUrl: './seat-list.component.html',
  styleUrls: ['./seat-list.component.css'],
})
export class SeatListComponent implements OnInit {
  @Input() venueId!: string;
  @Input() isAdmin = false;

  seats: any[] = [];
  sections: Section[] = [];
  selectedSeat: any = null;
  showCreateForm = false;
  showCreateSectionForm = false;
  createSeatForm!: FormGroup;
  createSectionForm!: FormGroup;
  loading = false;

  levelOptions = [
    { label: 'Lower', value: 'lower' },
    { label: 'Middle', value: 'middle' },
    { label: 'Upper', value: 'upper' },
    { label: 'VIP', value: 'vip' },
  ];

  constructor(
    private seatService: SeatService,
    private sectionService: SectionService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.loadSeats();
    this.loadSections();
    this.initializeForm();
  }

  initializeForm(): void {
    this.createSeatForm = this.fb.group({
      seatNumber: [null, [Validators.required]],
      row: [null, [Validators.required]],
      sectionId: [null, [Validators.required]],
    });

    this.createSectionForm = this.fb.group({
      name: ['', [Validators.required]],
      level: ['lower', [Validators.required]],
      totalRows: [null, [Validators.required, Validators.min(1)]],
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
      error: (err) => {
        console.error('Failed to load sections:', err);
      },
    });
  }

  getSectionName(sectionId: string): string {
    const section = this.sections.find((s) => s._id === sectionId);
    return section ? section.name : '';
  }

  onCreateSeat(): void {
    this.createSeatForm.markAllAsTouched();
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

  onCreateSection(): void {
    this.createSectionForm.markAllAsTouched();
    if (!this.createSectionForm.valid) return;

    this.loading = true;
    const sectionData = {
      ...this.createSectionForm.value,
      venueId: this.venueId,
    };

    this.sectionService.createSection(sectionData).subscribe({
      next: (section) => {
        this.sections.push(section);
        this.createSectionForm.reset({ level: 'lower' });
        this.showCreateSectionForm = false;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to create section:', err);
        this.loading = false;
      },
    });
  }

  deleteSection(sectionId: string): void {
    if (confirm('Are you sure? All seats in this section will also be deleted.')) {
      this.sectionService.deleteSection(sectionId).subscribe({
        next: () => {
          this.sections = this.sections.filter((s) => s._id !== sectionId);
          this.loadSeats();
        },
        error: (err) => {
          console.error('Failed to delete section:', err);
        },
      });
    }
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
