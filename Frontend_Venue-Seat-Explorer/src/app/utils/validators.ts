import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  AsyncValidatorFn,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export class CustomValidators {
  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const isLongEnough = value.length >= 8;

      const passwordValid =
        hasUpperCase && hasLowerCase && hasNumber && isLongEnough;

      if (!passwordValid) {
        return {
          passwordStrength: {
            hasUpperCase,
            hasLowerCase,
            hasNumber,
            isLongEnough,
          },
        };
      }

      return null;
    };
  }

  static emailFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : { invalidEmail: true };
    };
  }

  static properName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const nameRegex = /^[A-Z][a-z]{2,}$/;
      return nameRegex.test(value) ? null : { invalidName: true };
    };
  }

  static usernameAvailability(http: HttpClient): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return new Promise((resolve) => resolve(null));
      }

      return http
        .post<{
          available: boolean;
          errors?: any;
        }>(`${environment.apiUrl}/api/auth/check-availability`, {
          username: control.value,
        })
        .pipe(
          map((response) => {
            return response.available ? null : { usernameNotAvailable: true };
          }),
        );
    };
  }

  static emailAvailability(http: HttpClient): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return new Promise((resolve) => resolve(null));
      }

      return http
        .post<{
          available: boolean;
          errors?: any;
        }>(`${environment.apiUrl}/api/auth/check-availability`, {
          email: control.value,
        })
        .pipe(
          map((response) => {
            return response.available ? null : { emailNotAvailable: true };
          }),
        );
    };
  }
}
