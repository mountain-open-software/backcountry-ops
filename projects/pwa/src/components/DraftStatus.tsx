import React from 'react';
import type { DraftSnapshot } from '@open-mountain/application';
export function DraftStatus({ draft }: { draft: DraftSnapshot<unknown> }) {
  if (draft.status === 'clean') return null;
  return (
    <p
      className={draft.status === 'error' ? 'error' : 'hint'}
      role={draft.status === 'error' ? 'alert' : 'status'}
    >
      {draft.status === 'error'
        ? `Draft autosave failed: ${draft.error} Keep this screen open or copy your text.`
        : draft.status === 'loading'
          ? 'Recovering draft…'
          : draft.status === 'recovered'
            ? 'Recovered your unsaved draft. It is not submitted or approved.'
            : draft.status === 'saving'
              ? 'Saving draft on this device…'
              : draft.status === 'saved'
                ? 'Draft saved on this device. Not submitted or approved.'
                : ''}
    </p>
  );
}
