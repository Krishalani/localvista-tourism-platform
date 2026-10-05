import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, startWith } from 'rxjs';

/** State of a value that is fetched from the API, so templates can show loading and error messages. */
export type Loadable<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error'; notFound: boolean };

export const LOADING = { status: 'loading' } as const;

export function toLoadable<T>(source: Observable<T>): Observable<Loadable<T>> {
  return source.pipe(
    map((data): Loadable<T> => ({ status: 'ready', data })),
    startWith<Loadable<T>>(LOADING),
    catchError((error: HttpErrorResponse) =>
      of<Loadable<T>>({ status: 'error', notFound: error.status === 404 }),
    ),
  );
}
