import { createTheme } from '@mui/material/styles';
import { tokens } from '@open-mountain/design-system';
export const webTheme = createTheme({
  palette: {
    primary: { main: tokens.color.primary, contrastText: tokens.color.onPrimary },
    error: { main: tokens.color.error },
    background: { default: tokens.color.background, paper: tokens.color.surface },
    text: { primary: tokens.color.text, secondary: tokens.color.muted },
    divider: tokens.color.outlineVariant,
  },
  shape: { borderRadius: tokens.radius.small },
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    button: { textTransform: 'none', fontWeight: 600, fontSize: tokens.type.supporting },
    body1: { fontSize: tokens.type.body },
    body2: { fontSize: tokens.type.supporting },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: tokens.control.minHeight,
          borderRadius: tokens.radius.small,
          padding: '10px 16px',
          '&.Mui-focusVisible': {
            outline: `${tokens.control.focusWidth}px solid ${tokens.color.focus}`,
            outlineOffset: 3,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: tokens.color.field },
        notchedOutline: { borderColor: tokens.color.outline },
      },
    },
    MuiInputLabel: { styleOverrides: { root: { color: tokens.color.muted } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: tokens.color.background, color: tokens.color.text },
      },
    },
  },
});
