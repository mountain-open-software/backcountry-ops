import { useLocalAI } from './useLocalAI';
import { useState, useEffect, useRef } from 'react';
import {
  assistantExamples,
  legacyAssistantNotes,
  proposeAssistantUpdate,
  proposeClassifiedNote,
  type AssistantProposal,
} from '@open-mountain/application';
import type { CommunityState, UserState, OperationalDay, UserCommand } from '@open-mountain/domain';
import { useDraft } from './useDraft';
import type { DraftStore } from '@open-mountain/application';
export interface AssistantWorkspace {
  data: { userId: string; communityId: string; state: CommunityState; personal: UserState };
  storage: DraftStore;
  recordAssistantNote: (
    payload: Extract<UserCommand, { type: 'AssistantNoteRecorded' }>['payload'],
  ) => Promise<void>;
  updateAssistantNote: (
    payload: Extract<UserCommand, { type: 'AssistantNoteUpdated' }>['payload'],
  ) => Promise<void>;
  busy: boolean;
  run: (action: () => Promise<unknown>, success?: string) => Promise<boolean>;
  applyAssistantProposal: (proposal: AssistantProposal, dayId?: string) => Promise<void>;
}
interface Conversation {
  text: string;
  history: { role: 'You' | 'Assistant'; text: string }[];
  proposal: AssistantProposal | null;
  noteId?: string;
  proposalText?: string;
}
export function useAssistant(
  workspace: AssistantWorkspace,
  day: OperationalDay | undefined,
  createId: () => string,
  onTripCreated: (id: string) => void,
) {
  const { data } = workspace;
  const ai = useLocalAI(data.personal.localAI?.enabled === true);
  const notes = Object.values(data.personal.assistantNotes || {}).sort(
    (a, b) =>
      (a.sequence ?? 0) - (b.sequence ?? 0) ||
      a.createdAt.localeCompare(b.createdAt) ||
      a.id.localeCompare(b.id),
  );
  const [processingError, setProcessingError] = useState('');
  const [conversation, setConversation, draft] = useDraft<Conversation>(
    workspace.storage,
    data.userId,
    `assistant:${data.communityId}:${day?.id || 'planning'}`,
    { text: '', history: [], proposal: null },
  );
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const imported = useRef(false);
  const [migrating, setMigrating] = useState(false);
  useEffect(() => {
    if (draft.status === 'loading' || imported.current) return;
    imported.current = true;
    const available = legacyAssistantNotes(
      conversation.history,
      data.communityId || 'no-community',
      day?.id,
      `${data.state.community?.name || 'No community'} · ${day?.date || 'Trip planning'}`,
    );
    if (!available.length) return;
    setMigrating(true);
    void (async () => {
      try {
        for (const note of available) {
          await workspace.recordAssistantNote(note);
          await workspace.updateAssistantNote({
            id: note.id,
            status: 'recorded',
            response: 'Imported older conversation. Previous processing status is unknown.',
          });
        }
        const last = available[available.length - 1];
        const pending = conversation.proposal && last?.text === conversation.text;
        if (pending)
          await workspace.updateAssistantNote({
            id: last.id,
            status: conversation.proposal?.error ? 'clarification' : 'review',
            response: 'Imported pending proposal. Review before saving.',
          });
        setConversation((v) => ({ ...v, history: [], ...(pending ? { noteId: last.id } : {}) }));
      } catch {
        setProcessingError(
          'Earlier conversation could not be fully imported. It remains visible below; reload to retry.',
        );
      } finally {
        setMigrating(false);
      }
    })();
  }, [draft.status]);
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
    if (!conversation.text.trim() || conversation.text.length > 8000) return;
    setProcessing(true);
    setProcessingError('');
    const noteId = createId(),
      text = conversation.text;
    let recorded = false,
      engine: 'phrases' | 'local-model' = 'phrases';
    try {
      await workspace.recordAssistantNote({
        id: noteId,
        text,
        communityId: data.communityId || 'no-community',
        ...(day ? { dayId: day.id } : {}),
        context: `${data.state.community?.name || 'No community'} · ${day ? (data.state.trips[day.tripId]?.title || 'Trip') + ' · ' + day.date : 'Trip planning'}`,
      });
      recorded = true;
      await workspace.updateAssistantNote({ id: noteId, status: 'processing', engine });
      const context = {
        state: data.state,
        personal: data.personal,
        userId: data.userId,
        communityId: data.communityId,
        dayId: day?.id,
        now: new Date().toISOString(),
        createId,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      };
      let proposal = proposeAssistantUpdate({ ...context, text });
      if (
        day &&
        proposal.error &&
        proposal.unrecognized.length &&
        !proposal.changes.length &&
        ai.enabled &&
        ai.available
      ) {
        engine = 'local-model';
        await workspace.updateAssistantNote({
          id: noteId,
          status: 'processing',
          engine,
          response: 'Classifying with the on-device model…',
        });
        const classified = await ai.controller.classify(text);
        proposal = proposeClassifiedNote({ ...context, text, classified });
      }
      try {
        await checkFormDrafts(proposal);
      } catch (error) {
        proposal.error = error instanceof Error ? error.message : 'Could not check local drafts';
        proposal.actions = [];
      }
      await workspace.updateAssistantNote({
        id: noteId,
        status: proposal.error ? 'clarification' : 'review',
        engine,
        response:
          proposal.error || 'Ready for review. Nothing is saved to trip data until you confirm.',
      });
      setConversation((v) => ({ ...v, proposal, noteId, proposalText: text }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Processing failed; your note is preserved.';
      setProcessingError(message);
      if (recorded)
        try {
          await workspace.updateAssistantNote({
            id: noteId,
            status: /stopped|cancelled/i.test(message) ? 'stopped' : 'error',
            engine,
            response: message,
          });
        } catch {}
    } finally {
      setProcessing(false);
    }
  }
  async function save() {
    const proposal = conversation.proposal;
    if (!proposal || proposal.error || !proposal.actions.length) return;
    setSaving(true);
    const ok = await workspace.run(async () => {
      if (conversation.noteId)
        await workspace.updateAssistantNote({ id: conversation.noteId, status: 'saving' });
      await checkFormDrafts(proposal);
      await workspace.applyAssistantProposal(proposal, day?.id);
    }, 'Reviewed notes saved.');
    if (!ok && conversation.noteId) {
      try {
        await workspace.updateAssistantNote({
          id: conversation.noteId,
          status: 'error',
          response:
            'Saving did not complete. Retry this proposal to resume without duplicate records.',
        });
      } catch {}
    }
    if (ok) {
      if (conversation.noteId)
        try {
          await workspace.updateAssistantNote({
            id: conversation.noteId,
            status: 'saved',
            response: 'Reviewed changes saved.',
          });
        } catch (error) {
          setProcessingError(
            'Trip records saved, but the note status could not be updated. Your note is retained.',
          );
        }
      setConversation((v) => ({
        ...v,
        text: v.text === (conversation.proposalText ?? conversation.text) ? '' : v.text,
        proposal: null,
        noteId: undefined,
        proposalText: undefined,
      }));
      const trip = proposal.actions.find((a) => a.command.type === 'TripCreated');
      if (trip?.command.type === 'TripCreated') onTripCreated(trip.command.payload.id);
    }
    setSaving(false);
  }
  return {
    conversation,
    notes,
    processing,
    processingError,
    model: ai,
    draft,
    examples: assistantExamples,
    process,
    save,
    appendText: (text: string) =>
      setConversation((v) => ({
        ...v,
        text: [v.text, text].filter(Boolean).join(' '),
        proposal: null,
      })),
    setText: (text: string) => setConversation((v) => ({ ...v, text, proposal: null })),
    discard: () => {
      if (conversation.noteId)
        void workspace.updateAssistantNote({
          id: conversation.noteId,
          status: 'stopped',
          response: 'Proposal dismissed. Original note retained.',
        });
      setConversation((v) => ({ ...v, proposal: null }));
    },
    disabled: workspace.busy || migrating || saving || processing || draft.status === 'loading',
  };
}
