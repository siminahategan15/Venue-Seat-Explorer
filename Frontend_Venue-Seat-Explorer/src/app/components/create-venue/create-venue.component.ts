import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VenueService } from 'src/app/services/venue.service';

@Component({
  selector: 'app-create-venue',
  templateUrl: './create-venue.component.html',
  styleUrls: ['./create-venue.component.css'],
})
export class CreateVenueComponent implements OnInit {
  venueForm!: FormGroup;
  loading = false;
  error = '';
  selectedLocation: any = null;

  categories = [
    'Stadium',
    'Theater',
    'Concert Hall',
    'Sports',
    'Museum',
    'Other',
  ];
  amenities = [
    'WiFi',
    'Parking',
    'Restrooms',
    'Food Court',
    'Wheelchair Access',
    'First Aid',
  ];

  constructor(
    private fb: FormBuilder,
    private venueService: VenueService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.venueForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      city: ['', Validators.required],
      country: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1)]],
      description: ['', Validators.required],
      address: ['', Validators.required],
      phone: [''],
      website: [''],
      categories: [[]],
      amenities: [[]],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
    });
  }

  onLocationSelected(location: any): void {
    this.selectedLocation = location;
    this.venueForm.patchValue({
      latitude: location.lat,
      longitude: location.lng,
      address: location.address || location.formatted_address,
    });
  }

  async onSubmit(): Promise<void> {
    if (this.venueForm.invalid) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const formValue = this.venueForm.value;
      const venueData = {
        name: formValue.name,
        city: formValue.city,
        country: formValue.country,
        capacity: formValue.capacity,
        description: formValue.description,
        phone: formValue.phone,
        website: formValue.website,
        categories: formValue.categories,
        amenities: formValue.amenities,
        location: {
          latitude: formValue.latitude,
          longitude: formValue.longitude,
          address: formValue.address,
        },
      };

      const response = await this.venueService
        .createVenue(venueData)
        .toPromise();
      this.router.navigate(['/venue', response._id]);
    } catch (err: any) {
      this.error = err?.error?.message || 'Failed to create venue';
      this.loading = false;
    }
  }
}
