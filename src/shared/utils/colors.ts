export const darkenColor = (color: string, amount: number = 0.3): string => {
  const hex = color.replace('#', '');

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const darkR = Math.max(0, r - Math.round(r * amount));
  const darkG = Math.max(0, g - Math.round(g * amount));
  const darkB = Math.max(0, b - Math.round(b * amount));

  return `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`;
};
