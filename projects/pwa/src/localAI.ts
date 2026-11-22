import { createLocalModelController, localModel } from '@open-mountain/application';
import wasmURL from '@wllama/wllama/esm/wasm/wllama.wasm?url';
let engine: import('@wllama/wllama').Wllama | null = null;
const modelCache = 'backcountry-local-model-v1',
  runtimeCache = 'backcountry-ai-runtime';
const cached = async () => (await caches.open(modelCache)).match(localModel.url);
export const localAI = createLocalModelController({
  async hasModel() {
    if (!globalThis.caches) return false;
    const response = await cached();
    return (
      response?.headers.get('x-model-sha256') === localModel.sha256 &&
      !!(await (await caches.open(runtimeCache)).match(wasmURL))
    );
  },
  async checkResources(kind) {
    if (document.hidden) throw new Error('Keep the app visible while using local AI');
    if (!globalThis.caches || !globalThis.WebAssembly || !window.isSecureContext)
      throw new Error('Local AI needs a modern browser, HTTPS and local storage.');
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean };
      deviceMemory?: number;
      getBattery?: () => Promise<{ level: number; charging: boolean }>;
    };
    if (nav.connection?.saveData && kind === 'download')
      throw new Error('Data saver is enabled. Turn it off before downloading the model.');
    if (nav.deviceMemory && nav.deviceMemory < 2)
      throw new Error(
        'Local AI requires at least 2 GB device memory. Typed phrases remain available.',
      );
    if (nav.getBattery) {
      const battery = await nav.getBattery();
      if (!battery.charging && battery.level <= 0.2)
        throw new Error('Charge above 20% or plug in before using local AI.');
    }
    if (kind === 'download' && navigator.storage?.estimate) {
      const { usage = 0, quota = 0 } = await navigator.storage.estimate();
      if (quota && quota - usage < localModel.bytes * 2 + localModel.runtimeBytes)
        throw new Error('Not enough browser storage. Free at least 220 MB before downloading.');
    }
  },
  async download(signal, onProgress) {
    const cache = await caches.open(modelCache);
    const previous = await cache.match(localModel.url);
    const verified = previous?.headers.get('x-model-sha256') === localModel.sha256;
    try {
      const response = verified ? previous! : await fetch(localModel.url, { signal });
      if (!response.ok || !response.body) throw new Error('Model download failed');
      const reader = response.body.getReader(),
        chunks: Uint8Array<ArrayBuffer>[] = [];
      let received = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.length;
        if (received > localModel.bytes) {
          await reader.cancel();
          throw new Error('Unexpected model size');
        }
        chunks.push(new Uint8Array(value));
        onProgress(received / (localModel.bytes + localModel.runtimeBytes));
      }
      if (received !== localModel.bytes) throw new Error('Incomplete model download');
      const blob = new Blob(chunks),
        hash = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
      const hex = Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
      if (hex !== localModel.sha256) throw new Error('Model checksum mismatch');
      if (signal.aborted) throw new Error('Download cancelled');
      const runtime =
        (await (await caches.open(runtimeCache)).match(wasmURL)) ||
        (await fetch(wasmURL, { signal }));
      if (!runtime.ok) throw new Error('Could not download the browser AI runtime');
      await (await caches.open(runtimeCache)).put(wasmURL, runtime);
      await cache.put(localModel.url, new Response(blob, { headers: { 'x-model-sha256': hex } }));
    } catch (error) {
      if (!verified || (error instanceof Error && error.message === 'Model checksum mismatch'))
        await cache.delete(localModel.url);
      throw error;
    }
  },
  async remove() {
    await caches.delete(modelCache);
    await caches.delete(runtimeCache);
  },
  async classify(text, signal) {
    const response = await cached();
    if (!response)
      throw new Error('Model was removed by the browser. Download it again in Settings.');
    const { Wllama } = await import('@wllama/wllama');
    engine = new Wllama({ default: wasmURL });
    const active = engine;
    await active.loadModel([await response.blob()], {
      n_ctx: 1024,
      n_threads: 1,
      n_gpu_layers: 0,
      n_parallel: 1,
    });
    if (signal.aborted) {
      await active.exit();
      throw new Error('Stopped');
    }
    const result = await active.createChatCompletion({
      messages: [{ role: 'user', content: localModel.prompt + text }],
      max_tokens: 24,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'note_classification',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              label: { type: 'string', enum: ['OBSERVATION', 'PRIVATE', 'UNSUPPORTED'] },
            },
            required: ['label'],
            additionalProperties: false,
          },
        },
      },
      temperature: 0,
      abortSignal: signal,
    });
    return String(result.choices[0]?.message.content || 'UNSUPPORTED');
  },
  stop() {
    if (engine) {
      const active = engine;
      engine = null;
      void active.exit();
    }
  },
  async unload() {
    if (engine) {
      const active = engine;
      engine = null;
      await active.exit();
    }
  },
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) localAI.stop();
});
