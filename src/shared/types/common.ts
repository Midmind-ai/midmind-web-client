import type { components } from '@shared/services/types/generated';

export type MessageResponse = components['schemas']['MessageDto'];

export type PaginatedResponse<T> = {
  data: T;
  meta: components['schemas']['PaginationMetadata'];
};
