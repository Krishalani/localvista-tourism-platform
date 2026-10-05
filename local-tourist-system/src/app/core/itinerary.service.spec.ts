import { TestBed } from '@angular/core/testing';
import { ItineraryService } from './itinerary.service';
import { Attraction } from './models';

function attraction(id: number, name = `Attraction ${id}`): Attraction {
  return {
    id,
    name,
    categoryId: 1,
    categoryName: 'Nature',
    description: 'Test attraction',
    openingHours: null,
    travelTips: null,
    distanceFromKandyKm: 5,
    imageUrl: null,
    latitude: 7.29,
    longitude: 80.64,
  };
}

describe('ItineraryService (one-day visit plan)', () => {
  let service: ItineraryService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItineraryService);
  });

  it('TC27 starts with an empty plan', () => {
    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
  });

  it('TC28 adds an attraction to the plan (FR-10)', () => {
    const added = service.add(attraction(1));

    expect(added).toBe(true);
    expect(service.count()).toBe(1);
    expect(service.contains(1)).toBe(true);
  });

  it('TC29 does not add the same attraction twice (FR-13)', () => {
    service.add(attraction(1));

    const addedAgain = service.add(attraction(1));

    expect(addedAgain).toBe(false);
    expect(service.count()).toBe(1);
  });

  it('TC30 removes an attraction from the plan (FR-11)', () => {
    service.add(attraction(1));
    service.add(attraction(2));

    service.remove(1);

    expect(service.items().map((a) => a.id)).toEqual([2]);
  });

  it('TC31 lists every attraction in the order it was added (FR-12)', () => {
    service.add(attraction(3));
    service.add(attraction(1));
    service.add(attraction(2));

    expect(service.items().map((a) => a.id)).toEqual([3, 1, 2]);
  });

  it('TC32 moves a stop earlier or later and ignores moves past either end', () => {
    service.add(attraction(1));
    service.add(attraction(2));
    service.add(attraction(3));

    service.move(3, -1);
    expect(service.items().map((a) => a.id)).toEqual([1, 3, 2]);

    service.move(1, -1);
    service.move(2, 1);
    expect(service.items().map((a) => a.id)).toEqual([1, 3, 2]);
  });

  it('TC33 keeps the plan for the browser session', () => {
    service.add(attraction(1));
    service.add(attraction(2));

    // A fresh instance stands in for the service created after a page reload.
    TestBed.resetTestingModule();
    const reloaded = TestBed.inject(ItineraryService);

    expect(reloaded.items().map((a) => a.id)).toEqual([1, 2]);
  });

  it('TC34 clears the whole plan', () => {
    service.add(attraction(1));
    service.add(attraction(2));

    service.clear();

    expect(service.count()).toBe(0);
    expect(sessionStorage.getItem('one-day-plan')).toBeNull();
  });
});
