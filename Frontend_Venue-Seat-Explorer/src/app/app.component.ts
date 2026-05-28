import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Frontend_Venue-Seat-Explorer';

  constructor(public router: Router) {}

  get showNavbar(): boolean {
    return !['/login', '/register'].includes(this.router.url);
  }
}
