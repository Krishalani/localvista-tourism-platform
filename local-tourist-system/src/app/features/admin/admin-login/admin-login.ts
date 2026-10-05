import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected username = '';
  protected password = '';
  protected readonly error = signal('');

  constructor() {
    if (this.auth.isAuthenticated()) {
      void this.router.navigateByUrl('/admin');
    }
  }

  submit(): void {
    this.error.set('');
    const ok = this.auth.login(this.username, this.password);
    if (!ok) {
      this.error.set('Invalid username or password. Access denied.');
      return;
    }
    void this.router.navigateByUrl('/admin');
  }
}
