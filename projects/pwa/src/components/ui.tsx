import React from 'react';
import MaterialButton from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { tokens } from '@open-mountain/design-system';
export const Button = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>
>(function Button({ className = '', type = 'submit', ...props }, ref) {
  const primary = /(?:^|\s)primary(?:\s|$)/.test(className) || props['aria-current'] === 'page';
  return (
    <MaterialButton
      ref={ref}
      type={type}
      variant={primary ? 'contained' : 'outlined'}
      className={className}
      {...props}
    />
  );
});
export function Panel({ className = '', ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <Paper
      component="section"
      variant="outlined"
      className={className}
      sx={{
        borderRadius: `${tokens.radius.large}px`,
        backgroundColor: className.includes('private-panel')
          ? tokens.color.surfaceVariant
          : tokens.color.surface,
      }}
      {...props}
    />
  );
}
