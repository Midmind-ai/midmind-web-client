export type User = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string | null;
  last_name: string;
  first_name: string;
  avatar: string;
  provider: string | null;
  provider_id: string | null;
};
