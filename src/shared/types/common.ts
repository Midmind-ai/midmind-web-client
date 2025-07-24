export type MessageResponse = {
  message: string;
};

export type PaginationData = {
  currentPage: number;
  lastPage: number;
  next: number | null;
  prev: number | null;
  total: number;
  perPage: number;
};

export type PaginatedResponse<T> = {
  data: T;
  meta: PaginationData;
};
