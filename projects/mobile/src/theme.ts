import { MD3LightTheme } from 'react-native-paper';
import { tokens } from '@open-mountain/design-system';
export const nativeTheme = {
  ...MD3LightTheme,
  roundness: tokens.radius.small,
  colors: {
    ...MD3LightTheme.colors,
    primary: tokens.color.primary,
    onPrimary: tokens.color.onPrimary,
    primaryContainer: tokens.color.primaryContainer,
    onPrimaryContainer: tokens.color.onPrimaryContainer,
    background: tokens.color.background,
    surface: tokens.color.surface,
    onSurface: tokens.color.text,
    onSurfaceVariant: tokens.color.muted,
    surfaceVariant: tokens.color.surfaceVariant,
    outline: tokens.color.outline,
    outlineVariant: tokens.color.outlineVariant,
    error: tokens.color.error,
    onError: tokens.color.onError,
    errorContainer: tokens.color.errorContainer,
    onErrorContainer: tokens.color.error,
    elevation: {
      level0: tokens.color.surface,
      level1: tokens.color.surface,
      level2: tokens.color.surface,
      level3: tokens.color.surface,
      level4: tokens.color.surface,
      level5: tokens.color.surface,
    },
  },
};
