export const EntityEnum = {
  Workspace: 'workspace',
  Folder: 'folder',
  Mindlet: 'mindlet',
  Map: 'map',
  RootChat: 'root-chat',
  BranchChat: 'branch-chat',
  Chat: 'chat',
  Note: 'note',
  Prompt: 'prompt',
} as const;

export type EntityType = (typeof EntityEnum)[keyof typeof EntityEnum];
