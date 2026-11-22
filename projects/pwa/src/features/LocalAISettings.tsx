import React from 'react';
import { localModel } from '@open-mountain/application';
import { useLocalAI } from '../useLocalAI';
import type { ReadyWorkspace } from '../types';
import { Panel, Button } from '../components/ui';
export function LocalAISettings({ workspace }: { workspace: ReadyWorkspace }) {
  const ai = useLocalAI(workspace.data.personal.localAI?.enabled === true),
    working = ['downloading', 'processing'].includes(ai.status);
  async function setEnabled(enabled: boolean) {
    await ai.controller.configure(enabled);
    const ok = await workspace.run(() =>
      workspace.personalCommand('LocalAIConfigured', { enabled }),
    );
    if (!ok) await ai.controller.configure(workspace.data.personal.localAI?.enabled === true);
  }
  return (
    <Panel className="panel">
      <h2>On-device AI</h2>
      <label className="check">
        <input
          type="checkbox"
          checked={ai.enabled}
          disabled={workspace.busy}
          onChange={(e) => void setEnabled(e.currentTarget.checked)}
        />
        Enable optional local AI
      </label>
      <p>
        Disabled by default. Enabling does not download anything. Explicit phrases work without a
        model.
      </p>
      <p>
        {localModel.name}. About 106 MB for the model plus 11 MB browser runtime. Allow at least 220
        MB free storage and roughly 0.5–1 GB runtime memory. Prefer Wi-Fi and charging.
      </p>
      <p>
        AI classifies short free-form notes as field observations or private reflections; it does
        not invent facts or make safety decisions. Review every proposal. This text model does not
        provide voice recognition.
      </p>
      <p role="status">
        Model status: {ai.status}
        {ai.status === 'downloading' ? ` · ${Math.round(ai.progress * 100)}%` : ''}
        {ai.available ? ' · Downloaded on this device' : ''}
      </p>
      {!!ai.error && <p role="alert">{ai.error}</p>}
      <div className="row">
        <Button
          type="button"
          disabled={workspace.busy || !ai.enabled || ai.available || working}
          onClick={() => void ai.controller.download().catch(() => {})}
        >
          Download local model
        </Button>
        {working && (
          <Button type="button" onClick={ai.controller.stop}>
            Cancel AI operation
          </Button>
        )}
        <Button
          type="button"
          disabled={workspace.busy || working}
          onClick={() => void ai.controller.remove().catch(() => {})}
        >
          Remove downloaded model
        </Button>
      </div>
      <p className="hint">
        Runs only when you process a note that explicit phrases cannot handle. One CPU thread, short
        input and 45-second limit; model memory is released after each request and work stops when
        the tab is hidden. Disabling keeps the download until you remove it. The model is not
        included in backups.
      </p>
    </Panel>
  );
}
