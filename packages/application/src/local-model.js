export const localModel = {
  name: 'SmolLM2 135M Instruct · Q4',
  bytes: 105454432,
  runtimeBytes: 11 * 1024 * 1024,
  url: 'https://huggingface.co/bartowski/SmolLM2-135M-Instruct-GGUF/resolve/09816acd5d99df7be770d85ea30822623dab342c/SmolLM2-135M-Instruct-Q4_K_M.gguf',
  sha256: '2e8040ceae7815abe0dcb3540b9995eaa1fa0d2ca9e797d0a635ae4433c68c2d',
  prompt:
    'Classify the note. Reply with exactly OBSERVATION for observed weather, snow, terrain or field conditions, PRIVATE for personal readiness, fatigue, feelings or human factors, or UNSUPPORTED for requests, plans or anything uncertain. Do not give advice. Note: ',
};
export function classifiedNote(text, output) {
  if (/\b(private|fatigue|tired|worried|pressure|anxious|human factors)\b/i.test(text))
    return `Private reflection: ${text}`;
  let answer = output.trim();
  try {
    const parsed = JSON.parse(answer);
    answer = typeof parsed === 'string' ? parsed : parsed.label;
  } catch {}
  const tag = String(answer || '')
    .trim()
    .toUpperCase()
    .replace(/[.!]/g, '');
  if (tag === 'PRIVATE') return `Private reflection: ${text}`;
  if (tag === 'OBSERVATION') return `Observation: ${text}`;
  throw new Error(
    'The local model could not confidently classify this note. Use an explicit phrase or Trip data.',
  );
}
export function createLocalModelController(adapter) {
  let state = { enabled: false, available: false, status: 'disabled', progress: 0, error: '' },
    operation = null;
  const listeners = new Set();
  const publish = (patch) => {
    state = { ...state, ...patch };
    listeners.forEach((fn) => fn());
  };
  const stop = () => {
    operation?.abort();
    adapter.stop?.();
  };
  return {
    getSnapshot: () => state,
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    async configure(enabled) {
      if (state.enabled === enabled) return;
      publish({ enabled });
      if (!enabled) {
        stop();
        void adapter.unload();
      }
      const available = await adapter.hasModel().catch(() => false);
      publish({
        available,
        status: enabled ? (available ? 'ready' : 'not-downloaded') : 'disabled',
        error: '',
      });
    },
    async inspect() {
      const available = await adapter.hasModel().catch(() => false);
      publish({
        available,
        status: operation
          ? state.status
          : state.enabled
            ? available
              ? 'ready'
              : 'not-downloaded'
            : 'disabled',
      });
    },
    async download() {
      if (!state.enabled) throw new Error('Enable local AI before downloading.');
      if (operation) throw new Error('An AI operation is already running.');
      const abort = new AbortController();
      operation = abort;
      publish({ status: 'downloading', progress: 0, error: '' });
      let lastProgress = 0;
      try {
        await adapter.checkResources('download');
        if (abort.signal.aborted || !state.enabled) throw new Error('Download cancelled');
        await adapter.download(abort.signal, (progress) => {
          if (!abort.signal.aborted && (progress === 1 || Date.now() - lastProgress >= 200)) {
            lastProgress = Date.now();
            publish({ progress });
          }
        });
        if (abort.signal.aborted) throw new Error('Download cancelled');
        publish({ available: true, status: state.enabled ? 'ready' : 'disabled', progress: 1 });
      } catch (e) {
        const available = await adapter.hasModel().catch(() => false);
        publish({ available, status: state.enabled ? 'error' : 'disabled', error: e.message });
        throw e;
      } finally {
        operation = null;
      }
    },
    async remove() {
      stop();
      await adapter.unload();
      await adapter.remove();
      publish({
        available: false,
        status: state.enabled ? 'not-downloaded' : 'disabled',
        progress: 0,
        error: '',
      });
    },
    stop,
    async classify(text) {
      if (!state.enabled || !state.available)
        throw new Error('Download and enable the optional model first.');
      if (operation) throw new Error('An AI operation is already running.');
      if (text.length > 2000)
        throw new Error(
          'Use at most 2,000 characters per local AI note; explicit phrases accept longer notes.',
        );
      await adapter.checkResources('inference');
      if (!state.enabled || !state.available || operation)
        throw new Error('Local AI was disabled or is busy');
      const abort = new AbortController();
      operation = abort;
      publish({ status: 'processing', error: '' });
      const timer = setTimeout(() => abort.abort(), 45000);
      const cancelled = new Promise((_, reject) =>
        abort.signal.addEventListener(
          'abort',
          () => {
            adapter.stop?.();
            reject(new Error('Local AI stopped. Your note is preserved.'));
          },
          { once: true },
        ),
      );
      try {
        const output = await Promise.race([adapter.classify(text, abort.signal), cancelled]);
        return classifiedNote(text, output);
      } catch (e) {
        const available = await adapter.hasModel().catch(() => false);
        publish({ available, error: e.message });
        throw e;
      } finally {
        clearTimeout(timer);
        operation = null;
        void adapter.unload();
        publish({
          status: state.enabled ? (state.available ? 'ready' : 'not-downloaded') : 'disabled',
        });
      }
    },
  };
}
