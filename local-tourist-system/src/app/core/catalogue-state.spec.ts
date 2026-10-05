import { TestBed } from '@angular/core/testing';
import { CatalogueState } from './catalogue-state';

describe('CatalogueState (search and category filter)', () => {
  let state: CatalogueState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    state = TestBed.inject(CatalogueState);
  });

  it('TC35 starts with no search text and no category selected', () => {
    expect(state.filter()).toEqual({ search: '', categoryIds: [] });
    expect(state.isFiltered()).toBe(false);
  });

  it('TC36 selects several categories and deselects one on a second click (FR-05)', () => {
    state.toggleCategory(1);
    state.toggleCategory(4);
    expect(state.categoryIds()).toEqual([1, 4]);

    state.toggleCategory(1);
    expect(state.categoryIds()).toEqual([4]);
  });

  it('TC37 combines search text with the category filter (FR-06)', () => {
    state.search.set('temple');
    state.toggleCategory(1);

    expect(state.filter()).toEqual({ search: 'temple', categoryIds: [1] });
    expect(state.isFiltered()).toBe(true);
  });

  it('TC38 treats a search of only spaces as no filter', () => {
    state.search.set('   ');

    expect(state.isFiltered()).toBe(false);
  });

  it('TC39 keeps the filter while the tourist is on another page (FR-09)', () => {
    state.search.set('museum');
    state.toggleCategory(4);

    // The state is a root singleton, so the catalogue page gets the same values when it is reopened.
    const reopened = TestBed.inject(CatalogueState);

    expect(reopened.filter()).toEqual({ search: 'museum', categoryIds: [4] });
  });

  it('TC40 clears both the search text and the categories on reset', () => {
    state.search.set('museum');
    state.toggleCategory(4);

    state.reset();

    expect(state.filter()).toEqual({ search: '', categoryIds: [] });
  });
});
