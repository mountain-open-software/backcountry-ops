import React, { useEffect, useState, useRef } from 'react';
import { View, AppState } from 'react-native';
import {
  RecordingPresets,
  useAudioRecorder,
  useAudioRecorderState,
  useAudioPlayer,
  useAudioPlayerStatus,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import { Button, Note, styles } from './Controls';
export function RecordingCapture({
  onCapture,
  onError,
  disabled,
}: {
  onCapture: (uri: string) => void;
  onError: (text: string) => void;
  disabled: boolean;
}) {
  const lastDelivered = useRef<string | null>(null);
  const deliver = (uri: string) => {
    if (lastDelivered.current === uri) return;
    lastDelivered.current = uri;
    onCapture(uri);
  };
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, (status) => {
    if (status.hasError)
      onError(status.error || 'Recording interrupted. Check available audio before saving.');
    if (status.isFinished && status.url) deliver(status.url);
  });
  const status = useAudioRecorderState(recorder);
  const [starting, setStarting] = useState(false);
  async function stop() {
    try {
      await recorder.stop();
      if (recorder.uri) deliver(recorder.uri);
      await setAudioModeAsync({ allowsRecording: false });
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    }
  }
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && recorder.isRecording) void stop();
    });
    return () => sub.remove();
  }, [recorder]);
  async function start() {
    setStarting(true);
    try {
      lastDelivered.current = null;
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted)
        throw new Error('Microphone permission denied. Typed observations still work.');
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record({ forDuration: 600 });
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    } finally {
      setStarting(false);
    }
  }
  return (
    <View style={styles.section}>
      <Button
        title={
          status.isRecording
            ? `Stop recording · ${Math.floor(status.durationMillis / 1000)}s`
            : 'Record voice observation'
        }
        disabled={disabled || starting}
        primary
        onPress={() => void (status.isRecording ? stop() : start())}
      />
      <Note>
        Record offline, then stop and save the preview. Recordings stop when this app leaves the
        foreground. Up to 10 minutes / 20 MB. Keyboard dictation may be available on your device; no
        AI transcription is configured.
      </Note>
    </View>
  );
}
export function AudioPlayback({ uri }: { uri: string }) {
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);
  return (
    <Button
      title={status.playing ? 'Pause recording' : 'Play recording'}
      onPress={() => {
        if (status.playing) player.pause();
        else {
          if (status.didJustFinish) void player.seekTo(0);
          player.play();
        }
      }}
    />
  );
}
