import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { CommunityFields } from '../components/IdentityFields';
import { Button, Card, Heading, Field, Note, styles } from '../components/Controls';
import type { ReadyWorkspace } from '../useWorkspace';
function SelectedCommunity({ workspace }: { workspace: ReadyWorkspace }) {
  const { data, busy, run, renameCommunity } = workspace;
  const community = data.state.community!;
  const [name, setName] = useState(community.name);
  return (
    <>
      <Field
        label="Selected community name"
        value={name}
        maxLength={100}
        editable={!busy}
        onChangeText={setName}
      />
      <Field label="Selected community ID" value={community.id} editable={false} />
      <Note>The name can contain capitals and spaces. The ID is fixed after creation.</Note>
      <Button
        title="Save community"
        disabled={busy}
        onPress={() =>
          void run(
            () => renameCommunity(community.id, name),
            'Community updated. Its ID and trips are unchanged.',
          )
        }
      />
    </>
  );
}
export function CommunitySettings({ workspace }: { workspace: ReadyWorkspace }) {
  const { data, busy, run, refresh, addCommunity, deleteCommunity } = workspace;
  const [name, setName] = useState(''),
    [id, setId] = useState(''),
    [createKey, setCreateKey] = useState(0);
  const active = data.personal.communities.filter((c) => !c.removedAt);
  return (
    <>
      <Card>
        <Heading>Selected community</Heading>
        {data.state.community ? (
          <SelectedCommunity
            key={data.communityId + data.state.community.name}
            workspace={workspace}
          />
        ) : (
          <Note>No community selected. Create a community below to start planning.</Note>
        )}
      </Card>
      <Card>
        <Heading>My communities</Heading>
        {!active.length && <Note>No active communities.</Note>}
        {active.map((c) => (
          <View key={c.id} style={styles.card}>
            <Heading>{c.name}</Heading>
            <Note>ID: {c.id}</Note>
            <Button
              title={data.communityId === c.id ? 'Selected community' : `Select ${c.name}`}
              disabled={busy || data.communityId === c.id}
              onPress={() => void run(() => refresh(c.id))}
            />
            <Button
              title={`Delete ${c.name}`}
              disabled={busy}
              onPress={() =>
                Alert.alert(
                  'Delete community?',
                  `Remove ${c.name} from active communities? Trips, recordings and event history remain in full backups. The ID stays reserved.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () =>
                        void run(
                          () => deleteCommunity(c.id),
                          'Community deleted from active use. History remains in backups.',
                        ),
                    },
                  ],
                )
              }
            />
          </View>
        ))}
        <Heading>Create community</Heading>
        <CommunityFields
          key={createKey}
          nameLabel="New local community"
          name={name}
          id={id}
          onChange={(nextName, nextId) => {
            setName(nextName);
            setId(nextId);
          }}
        />
        <Button
          title="Create community"
          disabled={busy}
          onPress={() =>
            void run(async () => {
              await addCommunity(name.trim(), id);
              setName('');
              setId('');
              setCreateKey((v) => v + 1);
            }, 'Community created.')
          }
        />
      </Card>
    </>
  );
}
