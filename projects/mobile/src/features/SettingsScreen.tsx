import React, { useState } from 'react';
import { View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import type { ReadyWorkspace } from '../useWorkspace';
import { shareJSON } from '../nativeStorage';
import { Button, Card, Field, Heading, Note, styles } from '../components/Controls';
export function SettingsScreen({ workspace }: { workspace: ReadyWorkspace }) {
  const { data, busy, run, personalCommand, addCommunity, storage } = workspace;
  const [username, setUsername] = useState(data.personal.profile!.username),
    [community, setCommunity] = useState('');
  return (
    <View style={styles.section}>
      <Card>
        <Heading>Profile & communities</Heading>
        <Field label="Username" value={username} onChangeText={setUsername} maxLength={80} />
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
        <Field label="New community name" value={community} onChangeText={setCommunity} />
        <Button
          title="Create local community"
          disabled={busy}
          onPress={() => void run(() => addCommunity(community.trim()), 'Community created.')}
        />
        <Note>
          Independent local copy. No account, password, PIN, API, AI, or synchronization. Private
          notes live in your user database, not the community database.
        </Note>
      </Card>
      <Card>
        <Heading>Full local backups</Heading>
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
              await shareJSON('open-mountain-native-backup.json', backup);
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
