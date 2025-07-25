export type User = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string | null;
  last_name: string;
  first_name: string;
  avatar: string | null;
  provider: string | null;
  provider_id: string | null;
};

export type Chat = {
  id: string;
  created_at: string;
  name: string | null;
  updated_at: string | null;
};

export type ChatMessage = {
  id: string;
  content: string;
  role: 'user' | 'model';
  created_at: string;
};
