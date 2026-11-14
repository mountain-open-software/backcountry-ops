import definitions from './screens.json' with { type: 'json' };
export const screens = definitions;
export function validateScreen(screen) {
  if (screen?.version !== 1 || !Array.isArray(screen.fields) || screen.fields.some(f => !['text', 'date', 'textarea'].includes(f.kind))) {
    throw new Error('Unsupported screen definition');
  }
  return screen;
}
