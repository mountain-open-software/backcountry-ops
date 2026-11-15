import { Button } from './ui';
import type { BrowserSpeech } from '../types';
import React, { useEffect, useRef, useState } from 'react';
export function VoiceCapture({
  onCapture,
  onTranscript,
  disabled,
  onError,
}: {
  onCapture: (file: File) => void;
  onTranscript: (text: string) => void;
  disabled: boolean;
  onError: (text: string) => void;
}) {
  const recorder = useRef<MediaRecorder | null>(null),
    stream = useRef<MediaStream | null>(null),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    recognition = useRef<BrowserSpeech | null>(null);
  const [recording, setRecording] = useState(false),
    [dictating, setDictating] = useState(false);
  useEffect(
    () => () => {
      if (recorder.current?.state === 'recording') recorder.current.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
      recognition.current?.abort();
      clearTimeout(timer.current);
    },
    [],
  );
  async function start() {
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder)
        throw new Error(
          'Audio capture is unavailable in this browser. Use notes or attach a recording.',
        );
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const active = new MediaRecorder(stream.current),
        chunks: Blob[] = [];
      recorder.current = active;
      active.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
        if (
          chunks.reduce((n, c) => n + c.size, 0) > 19 * 1024 * 1024 &&
          active.state === 'recording'
        )
          active.stop();
      };
      active.onerror = () => {
        onError('Recording interrupted. Check the captured audio before saving.');
        stream.current?.getTracks().forEach((t) => t.stop());
        setRecording(false);
      };
      active.onstop = () => {
        clearTimeout(timer.current);
        stream.current?.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const blob = new Blob(chunks, { type: active.mimeType || 'audio/webm' });
        if (blob.size)
          onCapture(
            new File(
              [blob],
              `observation-${Date.now()}.${blob.type.includes('mp4') ? 'm4a' : 'webm'}`,
              { type: blob.type },
            ),
          );
      };
      active.start(1000);
      setRecording(true);
      timer.current = setTimeout(
        () => {
          if (active.state === 'recording') active.stop();
        },
        10 * 60 * 1000,
      );
    } catch (e) {
      stream.current?.getTracks().forEach((t) => t.stop());
      onError(e instanceof Error ? e.message : String(e));
    }
  }
  function dictate() {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) return;
    const active = new Speech();
    recognition.current = active;
    active.lang = navigator.language || 'en-US';
    active.interimResults = false;
    active.onresult = (e) =>
      onTranscript(
        Array.from(e.results)
          .map((result) => result[0].transcript)
          .join(' '),
      );
    active.onerror = (e) =>
      onError(
        `Dictation unavailable (${e.error}). Your recording and typed notes remain available.`,
      );
    active.onend = () => setDictating(false);
    try {
      active.start();
      setDictating(true);
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    }
  }
  const supportsSpeech = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  return (
    <div className="voice-box">
      <div className="row">
        <Button
          type="button"
          className={recording ? 'recording' : 'primary'}
          disabled={disabled || dictating}
          onClick={() => (recording ? recorder.current?.stop() : start())}
        >
          {recording ? '■ Stop recording' : '● Record observation'}
        </Button>
        {supportsSpeech && (
          <Button
            type="button"
            disabled={disabled || recording}
            onClick={() => (dictating ? recognition.current?.stop() : dictate())}
          >
            {dictating ? 'Stop dictation' : 'Dictate notes'}
          </Button>
        )}
      </div>
      <p className="hint" role="status">
        {recording
          ? 'Microphone recording · stop when finished (10-minute limit).'
          : 'Record offline; attach audio even without a transcript. Up to 20 MB.'}
      </p>
      <p className="hint">
        {supportsSpeech
          ? 'Optional dictation may use your browser’s online speech service. Review the text before saving.'
          : 'Device dictation is unavailable. Type notes or retain the original audio.'}{' '}
        Server AI is not configured.
      </p>
    </div>
  );
}
export function AudioPreview({ file }: { file: File | null }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!file) return;
    const value = URL.createObjectURL(file);
    setUrl(value);
    return () => URL.revokeObjectURL(value);
  }, [file]);
  return file ? <audio controls src={url} aria-label="Recording preview" /> : null;
}
