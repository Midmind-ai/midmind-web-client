import type { components } from 'generated/api-types';

export type MessageResponse = components['schemas']['MessageDto'];

export type PaginatedResponse<T> = {
  data: T;
  meta: components['schemas']['PaginationMetadata'];
};
