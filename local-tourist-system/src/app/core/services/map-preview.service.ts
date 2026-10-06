import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Replaceable map preview seam.
 * Today: Google Maps embed iframe URL from lat/lng.
 * Later: swap this service for the Google Maps JavaScript API (or another provider)
 * without changing attraction data or admin forms.
 */
@Injectable({ providedIn: 'root' })
export class MapPreviewService {
  constructor(private readonly sanitizer: DomSanitizer) {}

  /**
   * Builds a safe embed URL for the current iframe preview.
   * Replace the body of this method when wiring the real Maps API.
   */
  embedUrl(latitude: number, longitude: number, zoom = 14): SafeResourceUrl {
    const url = `https://maps.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
