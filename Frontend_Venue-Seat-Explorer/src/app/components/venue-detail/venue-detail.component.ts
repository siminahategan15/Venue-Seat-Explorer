declare const google: any;

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    private router: Router,
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

  checkIfAdmin(adminId: any): void {
    this.auth.authState$.subscribe((user) => {
      if (user && adminId) {
        this.auth.getCurrentUserMongoDB().subscribe({
          next: (userData) => {
            const adminIdStr =
              typeof adminId === 'object' ? adminId._id : adminId;
            this.isAdmin = userData._id === adminIdStr;
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

    const renderMap = () => {
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

    if ((window as any).google && (window as any).google.maps) {
      renderMap();
      return;
    }

    const existing = document.querySelector(
      'script[data-google-maps-loader="true"]',
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', renderMap);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.dataset['googleMapsLoader'] = 'true';
    script.onload = renderMap;
    document.head.appendChild(script);
  }

  getDirections(): void {
    if (!this.venue) return;
    this.router.navigate(['/venues', this.venue._id, 'directions']);
  }
}
