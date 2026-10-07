import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ItineraryService } from '../../core/services/itinerary.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell implements OnInit {
  private readonly router = inject(Router);
  protected readonly itinerary = inject(ItineraryService);
  protected readonly auth = inject(AuthService);

  ngOnInit(): void {
    void this.auth.initialize();
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    void this.router.navigateByUrl('/');
  }
}
