import React, { useState } from 'react';
import { View, Linking } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import type { OperationalDay } from '@open-mountain/domain';
import type { ReadyWorkspace } from '../useWorkspace';
import { validateGPX } from '../gpx';
import { Button, Card, Field, Heading, Note, styles } from '../components/Controls';
export function RouteScreen({
  day,
  workspace,
}: {
  day: OperationalDay;
  workspace: ReadyWorkspace;
}) {
  const [title, setTitle] = useState(''),
    [url, setUrl] = useState(''),
    [kind, setKind] = useState<'planned' | 'actual'>('planned');
  const { run, busy, command, storage, data } = workspace;
  async function upload() {
    await run(async () => {
      if (!title.trim()) throw new Error('Enter a route title first');
      const picked = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (picked.canceled) return;
      const asset = picked.assets[0],
        file = new File(asset.uri);
      if (file.size > 20 * 1024 * 1024) throw new Error('GPX must be at most 20 MB');
      const metadata = validateGPX(await file.text()),
        fileId = await storage.putFile(
          'community',
          data.communityId,
          asset.uri,
          asset.name,
          'application/gpx+xml',
        );
      await command('RouteAttached', {
        dayId: day.id,
        title,
        kind,
        url: '',
        fileId,
        fileName: asset.name,
        ...metadata,
      });
    }, 'Route file saved offline.');
  }
  return (
    <Card>
      <Heading>Routes & tracks</Heading>
      <Note>
        Use your own navigation app. Import original GPX or add an external Strava/Outmap/other
        link. No GPS track recording or route drawing. Links alone do not provide offline content.
      </Note>
      <Field label="Route title" value={title} onChangeText={setTitle} />
      <View style={styles.row}>
        <Button
          title="Planned route"
          primary={kind === 'planned'}
          onPress={() => setKind('planned')}
        />
        <Button
          title="Recorded track"
          primary={kind === 'actual'}
          onPress={() => setKind('actual')}
        />
      </View>
      <Button title="Import GPX file" disabled={busy} onPress={() => void upload()} />
      <Field
        label="External route link"
        autoCapitalize="none"
        keyboardType="url"
        value={url}
        onChangeText={setUrl}
      />
      <Button
        title="Save route link"
        disabled={busy}
        onPress={() =>
          void run(
            () =>
              command('RouteAttached', {
                dayId: day.id,
                title,
                kind,
                url,
                fileId: null,
                fileName: null,
              }),
            'External route reference saved.',
          )
        }
      />
      {day.routes.map((route, i) => (
        <View key={i} style={[styles.card, { backgroundColor: '#eef1e6' }]}>
          <Note>
            {route.title} · {route.kind}
            {route.points ? ` · ${route.points} points` : ''}
          </Note>
          {route.url && (
            <Button
              title="Open external route"
              onPress={() => void run(() => Linking.openURL(route.url))}
            />
          )}{' '}
          {route.fileId && (
            <Button
              title="Share original GPX"
              onPress={() =>
                void run(() => storage.shareFile('community', data.communityId, route.fileId!))
              }
            />
          )}
        </View>
      ))}
    </Card>
  );
}
