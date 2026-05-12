import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MenubarModule } from 'primeng/menubar';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RatingModule } from 'primeng/rating';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { VenueListComponent } from './components/venue-list/venue-list.component';
import { VenueDetailComponent } from './components/venue-detail/venue-detail.component';
import { SeatDetailComponent } from './components/seat-detail/seat-detail.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { CreateVenueComponent } from './components/create-venue/create-venue.component';
import { VenueAdminDashboardComponent } from './components/venue-admin-dashboard/venue-admin-dashboard.component';
import { LocationSearchComponent } from './components/location-search/location-search.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { SeatListComponent } from './components/seat-list/seat-list.component';
import { ReviewsAndMediaComponent } from './components/reviews-and-media/reviews-and-media.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    VenueListComponent,
    VenueDetailComponent,
    SeatDetailComponent,
    LoginComponent,
    RegisterComponent,
    CreateVenueComponent,
    VenueAdminDashboardComponent,
    LocationSearchComponent,
    SeatListComponent,
    ReviewsAndMediaComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    MenubarModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    TableModule,
    ProgressSpinnerModule,
    RatingModule,
    ReactiveFormsModule,
    MessageModule,
    PasswordModule,
    TabViewModule,
    TagModule,
    InputNumberModule,
    CheckboxModule,
    FileUploadModule,
    MultiSelectModule,
    DropdownModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
