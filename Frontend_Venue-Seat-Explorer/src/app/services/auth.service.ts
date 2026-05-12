import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  User as FirebaseUser,
} from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role?: 'admin' | 'user';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private app = initializeApp(environment.firebaseConfig);
  private auth = getAuth(this.app);
  currentUser: FirebaseUser | null = null;
  appUser: AppUser | null = null;

  private authStateSubject = new BehaviorSubject<AppUser | null>(null);
  authState$ = this.authStateSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
    this.authStateSubject.next(this.appUser);

    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;

      if (user) {
        this.appUser = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
        };
        this.saveUserToStorage(this.appUser);
      } else {
        this.appUser = null;
        this.clearUserFromStorage();
      }

      this.authStateSubject.next(this.appUser);
    });
  }

  register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    username: string,
  ) {
    return this.http.post<{ message: string; user: any }>(
      `${environment.apiUrl}/api/auth/register`,
      {
        email,
        password,
        firstName,
        lastName,
        username,
      },
    );
  }

  async login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    const user = await this.http
      .get<any>(`${environment.apiUrl}/api/users/me`)
      .toPromise();
    this.appUser = {
      uid: cred.user.uid,
      email: cred.user.email || '',
      displayName:
        cred.user.displayName || cred.user.email?.split('@')[0] || 'User',
      role: user.role,
    };
    this.saveUserToStorage(this.appUser);
    this.authStateSubject.next(this.appUser);
    return cred;
  }

  logout() {
    return signOut(this.auth).then(() => {
      this.clearUserFromStorage();
      this.authStateSubject.next(null);
    });
  }

  getCurrentUserMongoDB(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/users/me`);
  }

  async sendVerificationEmail(): Promise<void> {
    if (!this.auth.currentUser) {
      throw new Error('No authenticated user found.');
    }
    return sendEmailVerification(this.auth.currentUser);
  }

  async getIdToken(forceRefresh = false) {
    return this.auth.currentUser?.getIdToken(forceRefresh);
  }

  private saveUserToStorage(user: AppUser): void {
    localStorage.setItem('appUser', JSON.stringify(user));
  }

  private loadUserFromStorage(): void {
    const raw = localStorage.getItem('appUser');
    if (raw) {
      this.appUser = JSON.parse(raw);
    }
  }

  private clearUserFromStorage(): void {
    localStorage.removeItem('appUser');
  }

  isLoggedIn(): boolean {
    return (
      (this.currentUser !== null && this.currentUser.emailVerified === true) ||
      this.appUser !== null
    );
  }
}
