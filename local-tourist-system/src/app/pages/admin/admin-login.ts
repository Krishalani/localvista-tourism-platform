import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-login.html',
})
export class AdminLogin {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected readonly submitting = signal(false);
  protected readonly error = signal('');
  protected readonly sessionExpired = this.route.snapshot.queryParamMap.has('expired');

  constructor() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/admin']);
    }
  }

  protected submit(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.auth.login(username, password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl?.startsWith('/admin') ? returnUrl : '/admin');
      },
      error: (response: HttpErrorResponse) => {
        this.submitting.set(false);
        this.form.controls.password.reset();
        this.error.set(
          response.status === 401
            ? 'Invalid username or password.'
            : 'Could not reach the server. Check that it is running and try again.',
        );
      },
    });
  }
}
