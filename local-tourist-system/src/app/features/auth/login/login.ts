import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected username = '';
  protected password = '';
  protected readonly error = signal('');

  constructor() {
    if (this.auth.isAuthenticated()) {
      void this.router.navigateByUrl(this.homeForRole(this.auth.currentUser()!.role));
    }
  }

  submit(): void {
    this.error.set('');
    const result = this.auth.login(this.username, this.password);
    if (!result.ok || !result.user) {
      this.error.set('Invalid username or password. Please try again.');
      return;
    }

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl && result.user.role === 'Admin' && returnUrl.startsWith('/admin')) {
      void this.router.navigateByUrl(returnUrl);
      return;
    }

    void this.router.navigateByUrl(this.homeForRole(result.user.role));
  }

  private homeForRole(role: UserRole): string {
    return role === 'Admin' ? '/admin' : '/';
  }
}
