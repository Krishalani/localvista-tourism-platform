import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-auth-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.css',
})
export class AuthPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected username = '';
  protected password = '';
  protected readonly error = signal('');
  protected readonly loading = signal(false);

  constructor() {
    if (this.auth.isAdmin()) {
      void this.router.navigateByUrl('/admin');
    }
  }

  async submit(): Promise<void> {
    this.error.set('');
    this.loading.set(true);
    try {
      const result = await this.auth.login(this.username, this.password);
      if (!result.ok || !result.user) {
        this.error.set('Invalid admin username or password. Please try again.');
        return;
      }

      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      if (returnUrl?.startsWith('/admin')) {
        void this.router.navigateByUrl(returnUrl);
        return;
      }

      void this.router.navigateByUrl('/admin');
    } finally {
      this.loading.set(false);
    }
  }
}
