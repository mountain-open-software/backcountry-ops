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
