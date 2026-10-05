import { Directive, ElementRef, inject, input } from '@angular/core';

export const PLACEHOLDER_IMAGE = '/images/placeholder.svg';

/**
 * Shows the attraction photo, or a neutral placeholder when the attraction has no image
 * or the image fails to load.
 */
@Directive({
  selector: 'img[appAttractionImage]',
  host: {
    '[src]': 'appAttractionImage() || placeholder',
    '(error)': 'useFallback()',
  },
})
export class FallbackImage {
  readonly appAttractionImage = input<string | null>(null);
  protected readonly placeholder = PLACEHOLDER_IMAGE;
  private readonly image = inject<ElementRef<HTMLImageElement>>(ElementRef).nativeElement;

  protected useFallback(): void {
    if (!this.image.src.endsWith(PLACEHOLDER_IMAGE)) {
      this.image.src = PLACEHOLDER_IMAGE;
    }
  }
}
