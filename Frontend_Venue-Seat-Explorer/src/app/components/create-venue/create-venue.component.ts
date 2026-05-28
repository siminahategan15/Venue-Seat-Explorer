import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VenueService } from 'src/app/services/venue.service';

@Component({
  selector: 'app-create-venue',
  templateUrl: './create-venue.component.html',
  styleUrls: ['./create-venue.component.css'],
})
export class CreateVenueComponent implements OnInit {
  venueForm!: FormGroup;
  loading = false;
  loadingVenue = false;
  error = '';
  selectedLocation: any = null;
  isEditMode = false;
  venueId: string | null = null;

  categories = [
    { label: 'Stadium', value: 'Stadium' },
    { label: 'Theater', value: 'Theater' },
    { label: 'Concert Hall', value: 'Concert Hall' },
    { label: 'Sports', value: 'Sports' },
    { label: 'Museum', value: 'Museum' },
    { label: 'Other', value: 'Other' },
  ];
  amenities = [
    { label: 'WiFi', value: 'WiFi' },
    { label: 'Parking', value: 'Parking' },
    { label: 'Restrooms', value: 'Restrooms' },
    { label: 'Food Court', value: 'Food Court' },
    { label: 'Wheelchair Access', value: 'Wheelchair Access' },
    { label: 'First Aid', value: 'First Aid' },
  ];

  constructor(
    private fb: FormBuilder,
    private venueService: VenueService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.venueId = this.route.snapshot.params['id'] || null;
    this.isEditMode = !!this.venueId;
    if (this.isEditMode) {
      this.loadVenue();
    }
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

  loadVenue(): void {
    this.loadingVenue = true;
    this.venueService.getVenueById(this.venueId!).subscribe({
      next: (venue) => {
        this.venueForm.patchValue({
          name: venue.name,
          city: venue.city,
          country: venue.country,
          capacity: venue.capacity,
          description: venue.description,
          address: venue.location?.address || '',
          phone: venue.phone || '',
          website: venue.website || '',
          categories: venue.categories || [],
          amenities: venue.amenities || [],
          latitude: venue.location?.latitude || '',
          longitude: venue.location?.longitude || '',
        });
        this.loadingVenue = false;
      },
      error: () => {
        this.error = 'Failed to load venue';
        this.loadingVenue = false;
      },
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

      if (this.isEditMode) {
        await this.venueService.updateVenue(this.venueId!, venueData).toPromise();
        this.router.navigate(['/venues', this.venueId]);
      } else {
        const response = await this.venueService.createVenue(venueData).toPromise();
        this.router.navigate(['/venue', response._id]);
      }
    } catch (err: any) {
      this.error = err?.error?.message || (this.isEditMode ? 'Failed to update venue' : 'Failed to create venue');
      this.loading = false;
    }
  }
}
