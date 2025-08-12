export type ActionConfig = {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive';
  handler: (e: React.MouseEvent<HTMLElement>) => void;
  loading?: boolean;
};
