export const colorPalette = [
  "red",
  "blue",
  "green",
  "purple",
  "orange",
  "cyan",
] as const;

export type ColorPalette = (typeof colorPalette)[number];

/**
 * Get full name from firstName and lastName
 * @param firstName - User's first name
 * @param lastName - User's last name (optional)
 * @returns Full name string
 */
export const getFullName = (firstName: string, lastName?: string): string => {
  return lastName ? `${firstName} ${lastName}` : firstName;
};

/**
 * Pick a color palette based on firstName and lastName
 * @param firstName - User's first name
 * @param lastName - User's last name (optional)
 * @returns A color from the palette
 */
export const pickAvatarPalette = (
  firstName: string,
  lastName?: string
): ColorPalette => {
  const nameString = getFullName(firstName, lastName);

  // Calculate hash based on all characters
  let hash = 0;
  for (let i = 0; i < nameString.length; i++) {
    hash = (hash << 5) - hash + nameString.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Ensure positive index
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
};
