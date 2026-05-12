import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

import { HttpClient } from '@angular/common/http';
import { CustomValidators } from 'src/app/utils/validators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  error = '';
  roles = [
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' },
  ];

  constructor(
    private auth: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
    }

    this.initializeForm();
  }

  initializeForm(): void {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required, CustomValidators.properName()]],
        lastName: ['', [Validators.required, CustomValidators.properName()]],
        username: [
          '',
          [Validators.required, Validators.minLength(3)],
          [CustomValidators.usernameAvailability(this.http)],
        ],
        email: [
          '',
          [Validators.required, CustomValidators.emailFormat()],
          [CustomValidators.emailAvailability(this.http)],
        ],
        role: ['', [Validators.required]],
        password: [
          '',
          [Validators.required, CustomValidators.passwordStrength()],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator() },
    );
  }

  passwordMatchValidator(): any {
    return (formGroup: FormGroup) => {
      const password = formGroup.get('password');
      const confirmPassword = formGroup.get('confirmPassword');

      if (
        password &&
        confirmPassword &&
        password.value !== confirmPassword.value
      ) {
        confirmPassword.setErrors({ passwordMismatch: true });
      } else if (confirmPassword?.errors?.['passwordMismatch']) {
        confirmPassword.setErrors(null);
      }

      return null;
    };
  }

  get f() {
    return this.registerForm.controls;
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);

    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.capitalize(fieldName)} is required`;
      }
      if (field.errors['invalidName']) {
        return `${this.capitalize(fieldName)} must start with uppercase and be longer than 3 characters`;
      }
      if (field.errors['invalidEmail']) {
        return 'Please enter a valid email format';
      }
      if (field.errors['emailNotAvailable']) {
        return 'Email is already in use';
      }
      if (field.errors['usernameNotAvailable']) {
        return 'Username is already taken';
      }
      if (field.errors['passwordStrength']) {
        return 'Password must be at least 8 characters with uppercase, lowercase, and number';
      }
      if (field.errors['minlength']) {
        return `${this.capitalize(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }

    return '';
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async onRegister(): Promise<void> {
    if (this.registerForm.invalid) {
      this.error = 'Please fix all validation errors';
      return;
    }

    if (
      this.registerForm.get('password')?.value !==
      this.registerForm.get('confirmPassword')?.value
    ) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const formValue = this.registerForm.value;
      await firstValueFrom(
        this.auth.register(
          formValue.email,
          formValue.password,
          formValue.firstName,
          formValue.lastName,
          formValue.username,
        ),
      );

      const result = await this.auth.login(formValue.email, formValue.password);

      await this.auth.sendVerificationEmail();
      await this.auth.logout();

      this.loading = false;
      this.router.navigate(['/login']);
    } catch (err: any) {
      this.error = err?.message || 'Registration failed.';
      this.loading = false;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  hasUpperCase(password: string): boolean {
    return /[A-Z]/.test(password);
  }

  hasLowerCase(password: string): boolean {
    return /[a-z]/.test(password);
  }

  hasNumber(password: string): boolean {
    return /\d/.test(password);
  }

  hasMinLength(password: string): boolean {
    return password.length >= 8;
  }
}
