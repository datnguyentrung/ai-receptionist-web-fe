export interface SortMetadata {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface PageResponse<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  size: number;
  sort: SortMetadata;
  totalElements: number;
  totalPages: number;
}
