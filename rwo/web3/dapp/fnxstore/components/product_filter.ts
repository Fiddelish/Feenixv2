import { Subject } from 'rxjs';

export interface FilterState {
  queryString: string;
}

export const initialFilterState: FilterState = { queryString: "" };

export const filterState$ = new Subject<FilterState>();
filterState$.next(initialFilterState);
