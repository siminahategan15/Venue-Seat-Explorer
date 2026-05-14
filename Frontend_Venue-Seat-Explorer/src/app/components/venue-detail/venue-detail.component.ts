declare var google: any;

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VenueService } from 'src/app/services/venue.service';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import { Venue } from 'src/app/models';

@Component({
  selector: 'app-venue-detail',
  templateUrl: './venue-detail.component.html',
  styleUrls: ['./venue-detail.component.css'],
})
export class VenueDetailComponent implements OnInit {
  venue: Venue | null = null;
  isAdmin = false;
  mapCenter: any;
  activeTabIndex = 0;
  currentUserId: string | null = null;
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private venueService: VenueService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.loadVenue(params['id']);
    });
    this.checkCurrentUser();
  }

  checkCurrentUser(): void {
    this.auth.authState$.subscribe((user) => {
      if (user) {
        this.currentUserId = user.uid;
      }
    });
  }

  loadVenue(id: string): void {
    this.venueService.getVenueById(id).subscribe({
      next: (venue) => {
        this.venue = venue;
        if (venue.location) {
          this.mapCenter = {
            lat: venue.location.latitude,
            lng: venue.location.longitude,
          };
          setTimeout(() => this.initMap(), 500);
        }
        this.checkIfAdmin(venue.adminId);
      },
      error: (err) => {
        console.error('Failed to load venue:', err);
      },
    });
  }

  checkIfAdmin(adminId: string): void {
    this.auth.authState$.subscribe((user) => {
      if (user && adminId) {
        this.auth.getCurrentUserMongoDB().subscribe({
          next: (userData) => {
            this.isAdmin = userData._id === adminId;
          },
          error: () => {
            this.isAdmin = false;
          },
        });
      }
    });
  }

  initMap(): void {
    if (!this.mapContainer || !this.mapCenter) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      const map = new google.maps.Map(this.mapContainer.nativeElement, {
        zoom: 15,
        center: { lat: this.mapCenter.lat, lng: this.mapCenter.lng },
        mapTypeControl: true,
        fullscreenControl: true,
      });

      new google.maps.Marker({
        position: { lat: this.mapCenter.lat, lng: this.mapCenter.lng },
        map: map,
        title: this.venue?.name,
      });
    };
  }

  getDirections(): void {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${this.mapCenter.lat},${this.mapCenter.lng}`;
    window.open(url, '_blank');
  }
}
