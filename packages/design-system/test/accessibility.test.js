import test from 'node:test';
import assert from 'node:assert/strict';
import { tokens } from '@open-mountain/design-system';
function luminance(hex) {
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((value) => parseInt(value, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(a, b) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
test('shared normal text/status pairs meet WCAG AA contrast', () => {
  const c = tokens.color;
  for (const [foreground, background] of [
    [c.text, c.surface],
    [c.muted, c.surface],
    [c.muted, c.background],
    [c.onPrimary, c.primary],
    [c.onPrimaryContainer, c.primaryContainer],
    [c.error, c.errorContainer],
  ])
    assert.ok(contrast(foreground, background) >= 4.5, `${foreground} on ${background}`);
});
test('controls have 48px/dp targets and visible focus/control boundaries', () => {
  assert.ok(tokens.control.minHeight >= 48);
  assert.ok(contrast(tokens.color.focus, tokens.color.background) >= 3);
  assert.ok(contrast(tokens.color.outline, tokens.color.field) >= 3);
});
