/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#F7FAFC',
    tint: '#5B8CFF',
    background: '#07131E',
    foreground: '#F7FAFC',
    card: '#102231',
    cardForeground: '#F7FAFC',
    primary: '#4B8DFF',
    primaryForeground: '#FFFFFF',
    secondary: '#183247',
    secondaryForeground: '#F7FAFC',
    muted: '#122B3C',
    mutedForeground: '#91A6B8',
    accent: '#1B6D5C',
    accentForeground: '#D9FFF1',
    destructive: '#EF6B6B',
    destructiveForeground: '#FFFFFF',
    border: '#294355',
    input: '#1B3446',
    success: '#32C77D',
    warning: '#E9B55F',
    overlay: '#0A1C2A',
    map: '#0A202E',
    mapLine: '#163A4A',
    mapLineBright: '#276173',
  },
  dark: {
    text: '#F7FAFC',
    tint: '#5B8CFF',
    background: '#07131E',
    foreground: '#F7FAFC',
    card: '#102231',
    cardForeground: '#F7FAFC',
    primary: '#4B8DFF',
    primaryForeground: '#FFFFFF',
    secondary: '#183247',
    secondaryForeground: '#F7FAFC',
    muted: '#122B3C',
    mutedForeground: '#91A6B8',
    accent: '#1B6D5C',
    accentForeground: '#D9FFF1',
    destructive: '#EF6B6B',
    destructiveForeground: '#FFFFFF',
    border: '#294355',
    input: '#1B3446',
    success: '#32C77D',
    warning: '#E9B55F',
    overlay: '#0A1C2A',
    map: '#0A202E',
    mapLine: '#163A4A',
    mapLineBright: '#276173',
  },
  radius: 18,
};

export default colors;
