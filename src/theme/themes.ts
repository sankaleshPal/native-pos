import { Theme, ThemeSpacing, ThemeRadius, ThemeShadows } from './types';

const spacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const radius: ThemeRadius = {
  sm: 8,
  md: 12,
  lg: 16,
};

// Shadow generators for consistency
const createShadows = (shadowColor: string): ThemeShadows => ({
  level1: {
    shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  level2: {
    shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});

export const themes: Record<string, Theme> = {
  carbon_gold: {
    id: 'carbon_gold',
    name: 'Carbon Gold',
    isDark: true,
    colors: {
      background: '#0F0F0F',
      surface: '#1A1A1A',
      card: '#1F1F1F',
      header: '#D1D1D1',
      footer: '#D1D1D1',

      primary: '#C9A24D',
      secondary: '#8A6E2F',
      accent: '#E3C77A',

      textPrimary: '#FFFFFF',
      textSecondary: '#D1D1D1',
      textMuted: '#9A9A9A',
      textInverse: '#0F0F0F',

      border: '#2C2C2C',
      divider: '#262626',

      success: '#3FAE6C',
      warning: '#D9A441',
      error: '#D9534F',
      info: '#4DA3FF',
    },
    spacing,
    radius,
    shadows: createShadows('#000000'),
  },

  slate_pro: {
    id: 'slate_pro',
    name: 'Slate Pro',
    isDark: false,
    colors: {
      background: '#F5F7FA',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      header: '#EEF2F6',
      footer: '#EEF2F6',

      primary: '#2F3A4A',
      secondary: '#4F5D73',
      accent: '#a4b0c7ff',

      textPrimary: '#1A1A1A',
      textSecondary: '#4B5563',
      textMuted: '#9CA3AF',
      textInverse: '#FFFFFF',

      border: '#E5E7EB',
      divider: '#E2E8F0',

      success: '#16A34A',
      warning: '#CA8A04',
      error: '#DC2626',
      info: '#2563EB',
    },
    spacing,
    radius,
    shadows: createShadows('#000000'),
  },

  graphite_mono: {
    id: 'graphite_mono',
    name: 'Graphite Mono',
    isDark: true,
    colors: {
      background: '#121212',
      surface: '#1E1E1E',
      card: '#232323',
      header: '#181818',
      footer: '#181818',

      primary: '#E5E5E5',
      secondary: '#9CA3AF',
      accent: '#B0B0B0',

      textPrimary: '#F5F5F5',
      textSecondary: '#C7C7C7',
      textMuted: '#8A8A8A',
      textInverse: '#121212',

      border: '#2A2A2A',
      divider: '#303030',

      success: '#22C55E',
      warning: '#EAB308',
      error: '#EF4444',
      info: '#60A5FA',
    },
    spacing,
    radius,
    shadows: createShadows('#000000'),
  },

  pearl_blue: {
    id: 'pearl_blue',
    name: 'Pearl Blue',
    isDark: false,
    colors: {
      background: '#FFFFFF',
      surface: '#F0F4F8',
      card: '#FFFFFF',
      header: '#E8EEF6',
      footer: '#E8EEF6',

      primary: '#2563EB',
      secondary: '#1E40AF',
      accent: '#0EA5E9',

      textPrimary: '#0F172A',
      textSecondary: '#334155',
      textMuted: '#64748B',
      textInverse: '#FFFFFF',

      border: '#CBD5E1',
      divider: '#E2E8F0',

      success: '#16A34A',
      warning: '#F59E0B',
      error: '#DC2626',
      info: '#0284C7',
    },
    spacing,
    radius,
    shadows: createShadows('#000000'),
  },
};
