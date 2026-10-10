import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { getLocalVistaRuntimeConfig } from '../config/app-config';

/** Creates interactive Google Maps Embed API URLs from stored attraction coordinates. */
@Injectable({ providedIn: 'root' })
export class MapPreviewService {
  constructor(private readonly sanitizer: DomSanitizer) {}

  get isConfigured(): boolean {
    return !!getLocalVistaRuntimeConfig().googleMapsEmbedApiKey?.trim();
  }

  embedUrl(latitude: number, longitude: number, zoom = 14): SafeResourceUrl {
    const key = getLocalVistaRuntimeConfig().googleMapsEmbedApiKey?.trim();
    const query = `${latitude},${longitude}`;
    const url = key
      ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${encodeURIComponent(query)}&zoom=${zoom}`
      : `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
