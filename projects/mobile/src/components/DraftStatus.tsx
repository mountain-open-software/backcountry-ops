import React from 'react';
import { Text } from 'react-native';
import type { DraftSnapshot } from '@open-mountain/application';
import { tokens } from '@open-mountain/design-system';
export function DraftStatus({ draft }: { draft: DraftSnapshot<unknown> }) {
  if (draft.status === 'clean') return null;
  const error = draft.status === 'error';
  return (
    <Text
      accessibilityLiveRegion="polite"
      style={{ fontSize: 12, color: error ? tokens.color.error : tokens.color.muted }}
    >
      {error
        ? `Draft autosave failed: ${draft.error}. Keep this screen open or copy the text.`
        : draft.status === 'loading'
          ? 'Recovering draft…'
          : draft.status === 'recovered'
            ? 'Recovered unsaved draft. Not submitted or approved.'
            : draft.status === 'saving'
              ? 'Saving draft…'
              : draft.status === 'saved'
                ? 'Draft saved locally. Not submitted or approved.'
                : ''}
    </Text>
  );
}
