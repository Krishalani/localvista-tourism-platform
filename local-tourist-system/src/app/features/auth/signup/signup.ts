import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class SignupPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected displayName = '';
  protected username = '';
  protected password = '';
  protected confirmPassword = '';
  protected readonly error = signal('');

  constructor() {
    if (this.auth.isAuthenticated()) {
      void this.router.navigateByUrl('/');
    }
  }

  submit(): void {
    this.error.set('');

    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    const result = this.auth.signUp({
      displayName: this.displayName,
      username: this.username,
      password: this.password,
    });

    if (!result.ok) {
      this.error.set(
        result.reason === 'duplicate'
          ? 'That username is already taken. Try another.'
          : 'Please enter a display name, username (3+ chars), and password (6+ chars).',
      );
      return;
    }

    void this.router.navigateByUrl('/');
  }
}
