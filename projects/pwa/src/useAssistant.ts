import { useState } from 'react';
import {
  assistantExamples,
  proposeAssistantUpdate,
  type AssistantProposal,
} from '@open-mountain/application';
import type { CommunityState, UserState, OperationalDay } from '@open-mountain/domain';
import { useDraft } from './useDraft';
import type { DraftStore } from '@open-mountain/application';
export interface AssistantWorkspace {
  data: { userId: string; communityId: string; state: CommunityState; personal: UserState };
  storage: DraftStore;
  busy: boolean;
  run: (action: () => Promise<unknown>, success?: string) => Promise<boolean>;
  applyAssistantProposal: (proposal: AssistantProposal, dayId?: string) => Promise<void>;
}
interface Conversation {
  text: string;
  history: { role: 'You' | 'Assistant'; text: string }[];
  proposal: AssistantProposal | null;
}
export function useAssistant(
  workspace: AssistantWorkspace,
  day: OperationalDay | undefined,
  createId: () => string,
  onTripCreated: (id: string) => void,
) {
  const { data } = workspace;
  const [conversation, setConversation, draft] = useDraft<Conversation>(
    workspace.storage,
    data.userId,
    `assistant:${data.communityId}:${day?.id || 'planning'}`,
    { text: '', history: [], proposal: null },
  );
  const [processing, setProcessing] = useState(false);
  async function checkFormDrafts(proposal: AssistantProposal) {
    if (!day) return;
    const editors: string[] = [];
    for (const action of proposal.actions) {
      if (action.command.type === 'BriefingSaved')
        editors.push(`briefing:${day.briefing?.version || 0}`);
      if (action.command.type === 'DebriefSaved')
        editors.push(`debrief:${day.debrief?.completedAt || 'new'}`);
      if (action.command.type === 'ReflectionSaved') editors.push('reflection');
    }
    for (const editor of editors) {
      const saved = await workspace.storage.readDraft(
        data.userId,
        `${data.communityId}:${day.id}:${editor}`,
      );
      if (saved?.value != null)
        throw new Error(
          'There are unsaved form edits in Trip data. Save those edits first, then process these notes again.',
        );
    }
  }
  async function process() {
    setProcessing(true);
    const proposal = proposeAssistantUpdate({
      text: conversation.text,
      state: data.state,
      personal: data.personal,
      userId: data.userId,
      communityId: data.communityId,
      dayId: day?.id,
      now: new Date().toISOString(),
      createId,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    });
    try {
      await checkFormDrafts(proposal);
    } catch (error) {
      proposal.error =
        error instanceof Error ? error.message : 'Could not check local drafts. Try again.';
      proposal.actions = [];
    }
    setProcessing(false);
    setConversation((v) => ({
      ...v,
      proposal,
      history: [
        ...v.history,
        { role: 'You' as const, text: v.text },
        {
          role: 'Assistant' as const,
          text:
            proposal.error ||
            'Review the proposed changes below. Nothing is saved until you choose Save reviewed changes.',
        },
      ].slice(-12),
    }));
  }
  async function save() {
    const proposal = conversation.proposal;
    if (!proposal || proposal.error || !proposal.actions.length) return;
    const ok = await workspace.run(async () => {
      await checkFormDrafts(proposal);
      await workspace.applyAssistantProposal(proposal, day?.id);
    }, 'Reviewed notes saved.');
    if (!ok)
      setConversation((v) => ({
        ...v,
        history: [
          ...v.history,
          {
            role: 'Assistant' as const,
            text: 'Saving did not complete. Check the error and retry this proposal to resume without duplicating recorded changes. If data changed elsewhere, process your notes again.',
          },
        ].slice(-12),
      }));
    if (ok) {
      setConversation((v) => ({
        ...v,
        text: '',
        proposal: null,
        history: [
          ...v.history,
          {
            role: 'Assistant' as const,
            text: 'Saved your reviewed changes. Check Trip data to see the updated records.',
          },
        ].slice(-12),
      }));
      const trip = proposal.actions.find((a) => a.command.type === 'TripCreated');
      if (trip?.command.type === 'TripCreated') onTripCreated(trip.command.payload.id);
    }
  }
  return {
    conversation,
    draft,
    examples: assistantExamples,
    process,
    save,
    setText: (text: string) => setConversation((v) => ({ ...v, text, proposal: null })),
    discard: () => setConversation((v) => ({ ...v, proposal: null })),
    disabled: workspace.busy || processing || draft.status === 'loading',
  };
}
