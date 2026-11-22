import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui';
import type { BrowserSpeech } from '../types';
export function AssistantVoice({
  disabled,
  onTranscript,
}: {
  disabled: boolean;
  onTranscript: (text: string) => void;
}) {
  const active = useRef<BrowserSpeech | null>(null),
    [listening, setListening] = useState(false),
    [online, setOnline] = useState(false),
    [message, setMessage] = useState('');
  useEffect(() => () => active.current?.abort(), []);
  useEffect(() => {
    if (disabled) active.current?.abort();
  }, [disabled]);
  function start() {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) {
      setMessage(
        'This browser has no speech-to-text API. On Windows try Win+H; on macOS or mobile use keyboard dictation. Offline support depends on the installed language.',
      );
      return;
    }
    const recognition = new Speech();
    const local = 'processLocally' in recognition;
    if (!local && !online) {
      setMessage(
        'This browser cannot guarantee local speech recognition. Use keyboard dictation, or explicitly allow its online speech service below.',
      );
      return;
    }
    if (online && !navigator.onLine) {
      setMessage(
        'Online speech is unavailable offline. Use local keyboard dictation or type your note.',
      );
      return;
    }
    recognition.processLocally = !online;
    recognition.lang = navigator.language || 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (event) =>
      onTranscript(
        Array.from(event.results)
          .map((result) => result[0].transcript)
          .join(' '),
      );
    recognition.onerror = (event) => {
      setMessage(
        `Speech-to-text unavailable (${event.error}). Local language support may be missing; typed notes remain available.`,
      );
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    active.current = recognition;
    try {
      recognition.start();
      setListening(true);
      setMessage(
        online
          ? 'Using the browser speech service; audio may be sent online.'
          : 'Using on-device browser speech recognition.',
      );
    } catch {
      setMessage('Could not start speech-to-text. Use your keyboard microphone or type.');
    }
  }
  return (
    <div className="assistant-voice">
      <Button
        type="button"
        disabled={disabled}
        onClick={() => (listening ? active.current?.abort() : start())}
      >
        {listening ? 'Stop dictation' : 'Dictate note'}
      </Button>
      <details>
        <summary>Voice options for Windows and other devices</summary>
        <p>
          Windows: Win+H. macOS/iOS/Android: use the keyboard microphone or system dictation. OS
          speech may need an installed language or Internet connection. The optional text AI model
          is separate from speech recognition.
        </p>
        <label className="check">
          <input
            type="checkbox"
            checked={online}
            disabled={listening}
            onChange={(e) => setOnline(e.target.checked)}
          />
          Allow the browser speech service for this session (may send audio online)
        </label>
      </details>
      {!!message && (
        <p role="status" className="hint">
          {message}
        </p>
      )}
    </div>
  );
}
