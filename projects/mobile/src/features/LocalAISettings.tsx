import React from 'react';
import { Switch } from 'react-native';
import { localModel } from '@open-mountain/application';
import { useLocalAI } from '../useLocalAI';
import type { ReadyWorkspace } from '../useWorkspace';
import { Card, Heading, Note, Button } from '../components/Controls';
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
    <Card>
      <Heading>On-device AI</Heading>
      <Switch
        accessibilityLabel="Enable optional local AI"
        value={ai.enabled}
        disabled={workspace.busy}
        onValueChange={(enabled) => void setEnabled(enabled)}
      />
      <Note>
        Disabled by default. Enabling does not download anything. Explicit phrases work without a
        model.
      </Note>
      <Note>
        {localModel.name}. About 106 MB model download. Allow 320 MB free storage and roughly 0.5–1
        GB runtime memory. Prefer Wi-Fi and charging.
      </Note>
      <Note>
        Classifies short free-form notes as observations or private reflections, without inventing
        facts. Review every proposal. This text model does not provide voice recognition. Requires a
        native development/release build with llama.rn; Expo Go cannot run it.
      </Note>
      <Note>
        Model status: {ai.status}
        {ai.status === 'downloading' ? ` · ${Math.round(ai.progress * 100)}%` : ''}
        {ai.available ? ' · Downloaded on this device' : ''}
      </Note>
      {!!ai.error && <Note>{ai.error}</Note>}
      <Button
        title="Download local model"
        disabled={workspace.busy || !ai.enabled || ai.available || working}
        onPress={() => void ai.controller.download().catch(() => {})}
      />
      {working && <Button title="Cancel AI operation" onPress={ai.controller.stop} />}
      <Button
        title="Remove downloaded model"
        disabled={workspace.busy || working}
        onPress={() => void ai.controller.remove().catch(() => {})}
      />
      <Note>
        Only runs for notes explicit phrases cannot handle, using one CPU thread and a 45-second
        limit. Work stops in the background and model memory is released after use. Low
        battery/power-saving mode blocks AI. Disabling keeps the download until removed. Models are
        excluded from backups.
      </Note>
    </Card>
  );
}
