import { AssistantScreen } from '../src/features/AssistantScreen';
import { CommunitySettings } from '../src/features/CommunitySettings';
import { CommunityFields, IdentifierField } from '../src/components/IdentityFields';
import { Alert } from 'react-native';
import { DailyNavigation } from '../src/components/DailyNavigation';
import { dailyScreens } from '@open-mountain/design-system';
jest.mock('../src/components/Recording', () => ({
  RecordingCapture: () => null,
  AudioPlayback: () => null,
}));
jest.mock('expo-crypto', () => ({ randomUUID: () => 'native-observation-1' }));
import { ObservationScreen } from '../src/features/ObservationScreen';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { nativeTheme } from '../src/theme';
import { DebriefScreen } from '../src/features/DebriefScreen';
import { BriefingScreen } from '../src/features/BriefingScreen';
import { emptyCommunity, applyCommunity, makeEvent } from '@open-mountain/domain';
import type { OperationalDay } from '@open-mountain/domain';
import type { ReadyWorkspace } from '../src/useWorkspace';
function fixture() {
  let state = emptyCommunity(),
    number = 0;
  for (const command of [
    { type: 'CommunityCreated', payload: { name: 'Local' } },
    {
      type: 'TripCreated',
      payload: {
        id: 'trip-1',
        title: 'Day',
        startDate: '2026-11-15',
        endDate: '2026-11-15',
        timeZone: 'UTC',
      },
    },
  ])
    state = applyCommunity(
      state,
      makeEvent(state, command as never, {
        actorId: 'user-1',
        scopeId: 'community-1',
        eventId: `event-${++number}`,
        now: '2026-11-15T10:00:00Z',
      }),
    );
  const records = new Map();
  const storage = {
    readDraft: jest.fn(async (user, key) => records.get(`${user}:${key}`) || null),
    writeDraft: jest.fn(async (user, key, value, revision) => {
      const result = { revision: revision + 1, value, updatedAt: '' };
      records.set(`${user}:${key}`, result);
      return result;
    }),
  };
  const command = jest.fn(async () => {}),
    personalCommand = jest.fn(async () => {});
  const workspace = {
    data: {
      userId: 'user-1',
      communityId: 'community-1',
      personal: { profile: { id: 'user-1', username: 'Alex' }, reflections: {} },
      state,
    },
    storage,
    command,
    personalCommand,
    run: async (action: () => Promise<unknown>) => {
      await action();
      return true;
    },
    busy: false,
  } as unknown as ReadyWorkspace;
  return { day: state.days['trip-1:2026-11-15'], workspace, command, records };
}
const wrap = (node: React.ReactNode) => <PaperProvider theme={nativeTheme}>{node}</PaperProvider>;
test('native closing remains disabled until current submission and debrief exist', async () => {
  const f = fixture();
  const view = await render(wrap(<DebriefScreen day={f.day} workspace={f.workspace} />));
  await waitFor(() => expect(screen.queryByText('Recovering draft…')).toBeNull());
  expect(screen.getByRole('button', { name: 'Confirm day closing' })).toBeDisabled();
  const complete: OperationalDay = {
    ...f.day,
    submission: { observationVersion: 0, submittedAt: 'now', authorId: 'user-1' },
    debrief: {
      expected: 'Reviewed',
      actual: 'As planned',
      humanFactors: 'Discussed',
      good: 'Communication',
      change: 'Earlier start',
    },
  };
  await view.rerender(wrap(<DebriefScreen day={complete} workspace={f.workspace} />));
  await fireEvent.press(screen.getByRole('button', { name: 'Confirm day closing' }));
  await waitFor(() => expect(f.command).toHaveBeenCalledWith('DayClosed', { dayId: f.day.id }));
});
test('native briefing draft returns after remount without approving the plan', async () => {
  const f = fixture();
  let view = await render(wrap(<BriefingScreen day={f.day} workspace={f.workspace} />));
  await waitFor(() => expect(screen.queryAllByText('Recovering draft…')).toHaveLength(0));
  await fireEvent.changeText(
    screen.getByLabelText('Objective for the day'),
    'Unsaved native objective',
  );
  await waitFor(() => expect(f.workspace.storage.writeDraft).toHaveBeenCalled());
  await view.unmount();
  view = await render(wrap(<BriefingScreen day={f.day} workspace={f.workspace} />));
  await waitFor(() =>
    expect(screen.getByLabelText('Objective for the day')).toHaveDisplayValue(
      'Unsaved native objective',
    ),
  );
  expect(f.command).not.toHaveBeenCalled();
});

test('native typed observation recovers without submission and only saves on explicit action', async () => {
  const f = fixture();
  let view = await render(wrap(<ObservationScreen day={f.day} workspace={f.workspace} />));
  await waitFor(() => expect(screen.queryAllByText('Recovering draft…')).toHaveLength(0));
  await fireEvent.changeText(
    screen.getByLabelText('Observation title'),
    'Native recovered observation',
  );
  await waitFor(() => expect(f.workspace.storage.writeDraft).toHaveBeenCalled());
  await view.unmount();
  view = await render(wrap(<ObservationScreen day={f.day} workspace={f.workspace} />));
  await waitFor(() =>
    expect(screen.getByLabelText('Observation title')).toHaveDisplayValue(
      'Native recovered observation',
    ),
  );
  expect(f.command).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole('button', { name: 'Save observation' }));
  await waitFor(() =>
    expect(f.command).toHaveBeenCalledWith(
      'ObservationRecorded',
      expect.objectContaining({
        title: 'Native recovered observation',
        id: 'native-observation-1',
      }),
    ),
  );
});

test('native navigation exposes every shared destination and changes only on a tap', async () => {
  const onChange = jest.fn();
  await render(wrap(<DailyNavigation active="briefing" busy={false} onChange={onChange} />));
  for (const item of dailyScreens) {
    await fireEvent.press(screen.getByRole('button', { name: item.label }));
    expect(onChange).toHaveBeenLastCalledWith(item.id);
  }
  expect(onChange).toHaveBeenCalledTimes(5);
});

test('native plans add, reorder and remove with hazards kept on the same plan', async () => {
  const f = fixture();
  await render(wrap(<BriefingScreen day={f.day} workspace={f.workspace} />));
  await waitFor(() => expect(screen.queryAllByText('Recovering draft…')).toHaveLength(0));
  expect(screen.getByRole('button', { name: 'Remove plan A' })).toBeDisabled();
  await fireEvent.changeText(screen.getByLabelText('Plan A — where we go'), 'Ridge');
  await fireEvent.changeText(screen.getByLabelText('Plan A — hazards and uncertainty'), 'Wind');
  await fireEvent.press(screen.getByRole('button', { name: 'Add plan' }));
  await fireEvent.changeText(screen.getByLabelText('Plan B — where we go'), 'Forest');
  await fireEvent.changeText(screen.getByLabelText('Plan B — hazards and uncertainty'), 'Trees');
  await fireEvent.press(screen.getByRole('button', { name: 'Move plan B up' }));
  expect(screen.getByLabelText('Plan A — where we go')).toHaveDisplayValue('Forest');
  expect(screen.getByLabelText('Plan A — hazards and uncertainty')).toHaveDisplayValue('Trees');
  await fireEvent.press(screen.getByRole('button', { name: 'Remove plan B' }));
  expect(screen.queryByLabelText('Plan B — where we go')).toBeNull();
  expect(f.command).not.toHaveBeenCalled();
});

test('native identity fields normalize handles while preserving separate community names', async () => {
  let result = '';
  await render(
    wrap(
      <>
        <IdentifierField
          label="Username"
          value=""
          onChangeText={(value) => {
            result = value;
          }}
        />
        <CommunityFields
          name="Alpine Club"
          id="alpine-club"
          onChange={(name, id) => {
            result = name + '|' + id;
          }}
        />
      </>,
    ),
  );
  await fireEvent.changeText(screen.getByLabelText('Username'), 'Alex Smith!');
  expect(result).toBe('alex-smith');
  await fireEvent.changeText(screen.getByLabelText('Community name'), 'New Alpine Club');
  expect(result).toBe('New Alpine Club|new-alpine-club');
  await fireEvent.changeText(screen.getByLabelText('Community ID'), 'Custom ID!');
  expect(result).toBe('Alpine Club|custom-id');
});
test('native community settings list, select, rename and confirm deletion', async () => {
  const f = fixture();
  f.workspace.data.personal.communities = [
    { id: 'community-1', name: 'Local' },
    { id: 'second', name: 'Second Club' },
  ];
  f.workspace.refresh = jest.fn(async () => {});
  f.workspace.renameCommunity = jest.fn(async () => {});
  f.workspace.deleteCommunity = jest.fn(async () => {});
  f.workspace.addCommunity = jest.fn(async () => {});
  await render(wrap(<CommunitySettings workspace={f.workspace} />));
  expect(screen.getByLabelText('Selected community ID')).toHaveDisplayValue('community-1');
  await fireEvent.changeText(screen.getByLabelText('Selected community name'), 'Renamed Club');
  await fireEvent.press(screen.getByRole('button', { name: 'Save community' }));
  expect(f.workspace.renameCommunity).toHaveBeenCalledWith('community-1', 'Renamed Club');
  await fireEvent.press(screen.getByRole('button', { name: 'Select Second Club' }));
  expect(f.workspace.refresh).toHaveBeenCalledWith('second');
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await fireEvent.press(screen.getByRole('button', { name: 'Delete Second Club' }));
  expect(f.workspace.deleteCommunity).not.toHaveBeenCalled();
  const buttons = alert.mock.calls[0][2];
  await buttons?.find((button) => button.text === 'Delete')?.onPress?.();
  expect(f.workspace.deleteCommunity).toHaveBeenCalledWith('second');
  alert.mockRestore();
});

test('native assistant proposes notes and writes only after explicit review', async () => {
  const f = fixture();
  f.workspace.applyAssistantProposal = jest.fn(async () => {});
  await render(
    wrap(
      <AssistantScreen
        workspace={f.workspace}
        day={f.day}
        onTripCreated={() => {}}
        onOpenData={() => {}}
      />,
    ),
  );
  await waitFor(() => expect(screen.queryAllByText('Recovering draft…')).toHaveLength(0));
  await fireEvent.changeText(
    screen.getByLabelText('Message to assistant'),
    'Observation: Fresh wind loading.',
  );
  await fireEvent.press(screen.getByRole('button', { name: 'Process notes' }));
  await waitFor(() => expect(screen.getByText('Review proposed changes')).toBeTruthy());
  expect(f.workspace.applyAssistantProposal).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole('button', { name: 'Save reviewed changes' }));
  await waitFor(() =>
    expect(f.workspace.applyAssistantProposal).toHaveBeenCalledWith(
      expect.objectContaining({
        actions: [
          expect.objectContaining({
            scope: 'community',
            command: expect.objectContaining({ type: 'ObservationRecorded' }),
          }),
        ],
      }),
      f.day.id,
    ),
  );
});
test('native assistant protects pending form edits instead of silently replacing them', async () => {
  const f = fixture();
  f.records.set(`user-1:community-1:${f.day.id}:briefing:0`, {
    revision: 1,
    value: { objective: 'Unsaved manual plan' },
    updatedAt: '',
  });
  await render(
    wrap(
      <AssistantScreen
        workspace={f.workspace}
        day={f.day}
        onTripCreated={() => {}}
        onOpenData={() => {}}
      />,
    ),
  );
  await waitFor(() => expect(screen.queryAllByText('Recovering draft…')).toHaveLength(0));
  await fireEvent.changeText(
    screen.getByLabelText('Message to assistant'),
    'Our objective is the ridge.',
  );
  await fireEvent.press(screen.getByRole('button', { name: 'Process notes' }));
  await waitFor(() => expect(screen.getByText('Clarify your notes')).toBeTruthy());
  expect(screen.queryByRole('button', { name: 'Save reviewed changes' })).toBeNull();
  expect(f.command).not.toHaveBeenCalled();
});
