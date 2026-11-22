import { CommunitySettings } from './CommunitySettings';
import { IdentifierField } from '../components/IdentityFields';
import { normalizeIdentifier } from '@open-mountain/domain';
import React, { useState } from 'react';
import { View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import type { ReadyWorkspace } from '../useWorkspace';
import { shareJSON } from '../nativeStorage';
import { Button, Card, Field, Heading, Note, styles } from '../components/Controls';
export function SettingsScreen({ workspace }: { workspace: ReadyWorkspace }) {
  const { data, busy, run, personalCommand, storage } = workspace;
  const [username, setUsername] = useState(normalizeIdentifier(data.personal.profile!.username));
  return (
    <View style={styles.section}>
      <Card>
        <Heading>Profile</Heading>
        <Field label="User ID" value={data.userId} editable={false} />
        <IdentifierField
          label="Username"
          value={username}
          onChangeText={setUsername}
          maxLength={80}
        />
        <Button
          title="Update username"
          disabled={busy}
          onPress={() =>
            void run(
              () => personalCommand('ProfileConfigured', { username }),
              'Display name updated; your stable ID stays the same.',
            )
          }
        />
        <Note>
          Independent local copy. No account, password, PIN, API, AI, or synchronization. Private
          notes live in your user database, not the community database.
        </Note>
      </Card>
      <CommunitySettings workspace={workspace} />
      <Card>
        <Heading>Backup & restore</Heading>
        <Note>{`Device space available: ${(Paths.availableDiskSpace / 1048576).toFixed(0)} MB. Export before uninstalling or clearing app data. Autosaved text drafts are local recovery data, not part of portable backups; save records first.`}</Note>
        {Paths.availableDiskSpace < 100 * 1048576 && (
          <Note>
            Low device space: export recordings and a backup before continuing large captures.
          </Note>
        )}
        <Note>
          Backups include private notes, all communities, original recordings, and GPX. Keep them
          private. Restore does not merge divergent histories. Save/export before uninstalling this
          app.
        </Note>
        <Button
          title="Export full backup — includes private notes"
          disabled={busy}
          onPress={() =>
            void run(async () => {
              const backup = await storage.exportBackup(
                data.userId,
                data.personal.communities.map((c) => c.id),
              );
              await shareJSON('backcountry-ops-native-backup.json', backup);
            }, 'Backup is ready in the share sheet.')
          }
        />
        <Button
          title="Restore my backup"
          disabled={busy}
          onPress={() =>
            void run(async () => {
              const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
              });
              if (result.canceled) return;
              const file = new File(result.assets[0].uri);
              if (file.size > 100 * 1024 * 1024) throw new Error('Backup must be at most 100 MB');
              await storage.restoreBackup(JSON.parse(await file.text()), data.userId);
            }, 'Backup restored.')
          }
        />
        <Note>
          The native backup envelope also preserves the same event identities and file data as the
          browser backup format. Transfer is explicit backup/restore, not live synchronization.
        </Note>
      </Card>
    </View>
  );
}
