/**
 * Get a random color from the optimized branch colors palette
 * @returns A random hex color string
 */
export const getRandomColor = (): string => {
  const randomIndex = Math.floor(Math.random() * BRANCH_COLORS_OPTIMIZED.length);

  return BRANCH_COLORS_OPTIMIZED[randomIndex];
};

/**
 * Branch colors optimized for both themes
 * These specific colors tested for visibility as thin lines/borders
 */
export const BRANCH_COLORS_OPTIMIZED = [
  '#0EA5E9', // Sky Blue
  '#10B981', // Emerald
  '#F97316', // Orange
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#84CC16', // Lime
  '#F59E0B', // Amber
  '#14B8A6', // Teal
  '#A855F7', // Purple
  '#22C55E', // Green
  '#6366F1', // Indigo
  '#FB923C', // Coral
  '#94A3B8', // Slate
  '#F87171', // Light Red
  '#34D399', // Mint
  '#FACC15', // Yellow
  '#A78BFA', // Light Purple
];
