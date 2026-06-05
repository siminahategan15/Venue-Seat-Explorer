declare const google: any;

import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  NgZone,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VenueService } from 'src/app/services/venue.service';
import { environment } from 'src/environments/environment';
import { Venue } from 'src/app/models';

type TravelMode = 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';

interface DirectionsStep {
  instructions: string;
  distance: string;
  duration: string;
  maneuver?: string;
}

@Component({
  selector: 'app-directions',
  templateUrl: './directions.component.html',
  styleUrls: ['./directions.component.css'],
})
export class DirectionsComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  @ViewChild('originInput', { static: false }) originInput!: ElementRef;

  venue: Venue | null = null;
  destination: { lat: number; lng: number } | null = null;
  origin: { lat: number; lng: number } | null = null;
  originLabel = 'Your location';

  travelMode: TravelMode = 'DRIVING';
  travelModes: { label: string; value: TravelMode; icon: string }[] = [
    { label: 'Drive', value: 'DRIVING', icon: 'pi pi-car' },
    { label: 'Walk', value: 'WALKING', icon: 'pi pi-user' },
    { label: 'Bike', value: 'BICYCLING', icon: 'pi pi-compass' },
    { label: 'Transit', value: 'TRANSIT', icon: 'pi pi-send' },
  ];

  distanceText = '';
  durationText = '';
  steps: DirectionsStep[] = [];

  loading = true;
  errorMessage = '';
  liveTracking = true;

  private map: any;
  private directionsService: any;
  private directionsRenderer: any;
  private userMarker: any;
  private autocomplete: any;
  private watchId: number | null = null;
  private lastRoutedOrigin: { lat: number; lng: number } | null = null;
  private scriptLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private venueService: VenueService,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    const venueId = this.route.snapshot.paramMap.get('id');
    if (!venueId) {
      this.errorMessage = 'No venue id supplied.';
      this.loading = false;
      return;
    }
    this.venueService.getVenueById(venueId).subscribe({
      next: (venue) => {
        this.venue = venue;
        if (!venue.location) {
          this.errorMessage = 'This venue has no location data.';
          this.loading = false;
          return;
        }
        this.destination = {
          lat: venue.location.latitude,
          lng: venue.location.longitude,
        };
        this.loadGoogleMapsScript().then(() => this.initMap());
      },
      error: () => {
        this.errorMessage = 'Failed to load venue.';
        this.loading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.stopWatchingLocation();
  }

  goBack(): void {
    if (this.venue) {
      this.router.navigate(['/venues', this.venue._id]);
    } else {
      this.router.navigate(['/']);
    }
  }

  setTravelMode(mode: TravelMode): void {
    if (this.travelMode === mode) return;
    this.travelMode = mode;
    this.computeRoute();
  }

  toggleLiveTracking(): void {
    this.liveTracking = !this.liveTracking;
    if (this.liveTracking) {
      this.startWatchingLocation();
    } else {
      this.stopWatchingLocation();
    }
  }

  recenter(): void {
    if (!this.map || !this.origin || !this.destination) return;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(this.origin);
    bounds.extend(this.destination);
    this.map.fitBounds(bounds);
  }

  private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).google && (window as any).google.maps) {
        this.scriptLoaded = true;
        resolve();
        return;
      }
      const existing = document.querySelector(
        'script[data-google-maps-loader="true"]',
      ) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject());
        return;
      }
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.dataset['googleMapsLoader'] = 'true';
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
  }

  private initMap(): void {
    if (!this.destination) return;

    const tryInit = () => {
      if (!this.mapContainer) {
        setTimeout(tryInit, 50);
        return;
      }

      this.map = new google.maps.Map(this.mapContainer.nativeElement, {
        zoom: 13,
        center: this.destination,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: false,
      });

      this.directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        map: this.map,
        suppressMarkers: false,
        polylineOptions: { strokeColor: '#1d4ed8', strokeWeight: 5 },
      });

      new google.maps.Marker({
        position: this.destination,
        map: this.map,
        title: this.venue?.name,
        label: { text: 'B', color: 'white', fontWeight: 'bold' },
      });

      this.setupAutocomplete();
      this.requestUserLocation();
    };

    tryInit();
  }

  private setupAutocomplete(): void {
    if (!google.maps.places || !google.maps.places.Autocomplete) {
      return;
    }
    const tryAttach = () => {
      if (!this.originInput) {
        setTimeout(tryAttach, 50);
        return;
      }
      try {
        this.autocomplete = new google.maps.places.Autocomplete(
          this.originInput.nativeElement,
          { fields: ['geometry', 'formatted_address', 'name'] },
        );
        this.autocomplete.addListener('place_changed', () => {
          const place = this.autocomplete.getPlace();
          if (!place.geometry || !place.geometry.location) return;
          this.ngZone.run(() => {
            this.origin = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };
            this.originLabel =
              place.formatted_address || place.name || 'Origin';
            this.liveTracking = false;
            this.stopWatchingLocation();
            this.updateUserMarker();
            this.computeRoute();
          });
        });
      } catch (err) {
        console.warn('Places Autocomplete unavailable:', err);
      }
    };
    tryAttach();
  }

  private requestUserLocation(): void {
    if (!navigator.geolocation) {
      this.errorMessage =
        'Geolocation is not supported by your browser. Enter an origin address below.';
      this.loading = false;
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.ngZone.run(() => {
          this.origin = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          this.originLabel = 'Your location';
          this.updateUserMarker();
          this.computeRoute();
          if (this.liveTracking) this.startWatchingLocation();
        });
      },
      () => {
        this.ngZone.run(() => {
          this.errorMessage =
            'Could not access your location. Enter a starting address to get directions.';
          this.loading = false;
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  private startWatchingLocation(): void {
    if (!navigator.geolocation || this.watchId !== null) return;
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.ngZone.run(() => {
          const newOrigin = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          this.origin = newOrigin;
          this.updateUserMarker();
          if (this.shouldRerouteFor(newOrigin)) {
            this.computeRoute();
          } else {
            this.updateDistanceFromOrigin();
          }
        });
      },
      (error) => console.error('Geolocation error:', error),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 },
    );
  }

  private stopWatchingLocation(): void {
    if (this.watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  private shouldRerouteFor(newOrigin: { lat: number; lng: number }): boolean {
    if (!this.lastRoutedOrigin) return true;
    const meters = this.haversine(this.lastRoutedOrigin, newOrigin);
    return meters > 75;
  }

  private updateUserMarker(): void {
    if (!this.map || !this.origin) return;
    if (this.userMarker) {
      this.userMarker.setPosition(this.origin);
      return;
    }
    this.userMarker = new google.maps.Marker({
      position: this.origin,
      map: this.map,
      title: 'You are here',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#2563eb',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });
  }

  private computeRoute(): void {
    if (!this.origin || !this.destination || !this.directionsService) return;
    this.loading = true;
    this.errorMessage = '';

    this.directionsService.route(
      {
        origin: this.origin,
        destination: this.destination,
        travelMode: google.maps.TravelMode[this.travelMode],
        provideRouteAlternatives: false,
      },
      (result: any, status: string) => {
        this.ngZone.run(() => {
          this.loading = false;
          if (status !== 'OK' || !result) {
            this.errorMessage = `Could not compute a route (${status}).`;
            this.distanceText = '';
            this.durationText = '';
            this.steps = [];
            return;
          }
          this.directionsRenderer.setDirections(result);
          this.lastRoutedOrigin = { ...this.origin! };

          const leg = result.routes[0]?.legs[0];
          if (leg) {
            this.distanceText = leg.distance?.text || '';
            this.durationText = leg.duration?.text || '';
            this.steps = (leg.steps || []).map((s: any) => ({
              instructions: s.instructions,
              distance: s.distance?.text || '',
              duration: s.duration?.text || '',
              maneuver: s.maneuver,
            }));
          }
        });
      },
    );
  }

  private updateDistanceFromOrigin(): void {
    if (!this.origin || !this.destination) return;
    const meters = this.haversine(this.origin, this.destination);
    if (meters < 1000) {
      this.distanceText = `${Math.round(meters)} m`;
    } else {
      this.distanceText = `${(meters / 1000).toFixed(1)} km`;
    }
  }

  private haversine(
    a: { lat: number; lng: number },
    b: { lat: number; lng: number },
  ): number {
    const R = 6371000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
}
