import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  items: MenuItem[] = [];

  constructor(
    public auth: AuthService,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        command: () => this.navigateHome(),
      },
      {
        label: 'Venues',
        icon: 'pi pi-map',
        command: () => this.router.navigate(['/']),
      },
    ];
  }

  logout(): void {
    this.auth.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }
}
