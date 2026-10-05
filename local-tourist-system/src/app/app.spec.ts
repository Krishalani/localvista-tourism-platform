import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { ItineraryService } from './core/itinerary.service';

describe('App', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the main navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('.site-nav a')).map((a) => a.textContent?.trim());
    expect(links).toEqual(['Attractions', 'My One-Day Plan', 'Admin']);
  });

  it('should show how many attractions are in the plan', async () => {
    const fixture = TestBed.createComponent(App);
    TestBed.inject(ItineraryService).add({
      id: 1,
      name: 'Ceylon Tea Museum',
      categoryId: 4,
      categoryName: 'Museum',
      description: 'Test',
      openingHours: null,
      travelTips: null,
      distanceFromKandyKm: 4,
      imageUrl: null,
      latitude: null,
      longitude: null,
    });
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.badge')?.textContent?.trim()).toBe('1');
  });
});
