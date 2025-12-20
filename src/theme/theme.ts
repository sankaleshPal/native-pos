export const palette = {
  // Slate Scale (Neutral)
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
  slate950: '#020617',

  // Indigo Scale (Primary Brand)
  brand50: '#EEF2FF',
  brand100: '#E0E7FF',
  brand500: '#6366F1',
  brand600: '#4F46E5',
  brand700: '#4338CA',

  // Semantic
  success: '#059669', // Emerald 600
  successDark: '#34D399', // Emerald 400
  warning: '#D97706', // Amber 600
  warningDark: '#FBBF24', // Amber 400
  error: '#DC2626', // Red 600
  errorDark: '#F87171', // Red 400
  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '500', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyMedium: { fontSize: 16, fontWeight: '500', lineHeight: 24 },
  label: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  small: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
};

export const lightTheme = {
  colors: {
    background: palette.slate50,
    surface: palette.white,
    surfaceHighlight: palette.slate100,

    primary: palette.brand600,
    primaryForeground: palette.white,

    text: palette.slate900,
    textSecondary: palette.slate500,
    textInverse: palette.white,

    border: palette.slate200,
    borderFocus: palette.brand600,

    success: palette.success,
    warning: palette.warning,
    error: palette.error,
  },
  shadows: {
    card: {
      shadowColor: palette.slate900,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
  },
};

export const darkTheme = {
  colors: {
    background: palette.slate900,
    surface: palette.slate800,
    surfaceHighlight: palette.slate700,

    primary: palette.brand500,
    primaryForeground: palette.white,

    text: palette.slate50,
    textSecondary: palette.slate400,
    textInverse: palette.slate900,

    border: palette.slate700,
    borderFocus: palette.brand500,

    success: palette.successDark,
    warning: palette.warningDark,
    error: palette.errorDark,
  },
  shadows: {
    card: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
  },
};

export type Theme = typeof lightTheme;
