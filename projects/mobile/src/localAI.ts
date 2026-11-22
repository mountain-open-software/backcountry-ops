import { createLocalModelController, localModel } from '@open-mountain/application';
import { AppState, TurboModuleRegistry } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as FS from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';
import * as Battery from 'expo-battery';
let context: import('llama.rn').LlamaContext | null = null;
const model = new File(Paths.document, 'backcountry-smollm2-q4.gguf'),
  ready = new File(Paths.document, 'backcountry-smollm2-q4.ready');
let download: ReturnType<typeof FS.createDownloadResumable> | null = null;
export const localAI = createLocalModelController({
  async hasModel() {
    return (
      model.exists &&
      model.size === localModel.bytes &&
      ready.exists &&
      (await ready.text()) === localModel.sha256
    );
  },
  async checkResources(kind) {
    if (AppState.currentState && AppState.currentState !== 'active')
      throw new Error('Return to the app before using local AI');
    if (!TurboModuleRegistry.get('RNLlama'))
      throw new Error(
        'Local AI needs a native development/release build with llama.rn. It is unavailable in Expo Go.',
      );
    const power = await Battery.getPowerStateAsync();
    if (
      power.lowPowerMode ||
      (power.batteryLevel >= 0 &&
        power.batteryLevel <= 0.2 &&
        power.batteryState === Battery.BatteryState.UNPLUGGED)
    )
      throw new Error('Turn off low-power mode and charge above 20% or plug in before local AI.');
    if (kind === 'download' && Paths.availableDiskSpace < localModel.bytes * 2 + 100 * 1048576)
      throw new Error('Free at least 320 MB before downloading the model.');
  },
  async download(signal, onProgress) {
    if (signal.aborted) throw new Error('Download cancelled');
    if (ready.exists) ready.delete();
    if (model.exists) model.delete();
    const cancel = () => {
      void download?.pauseAsync();
    };
    signal.addEventListener('abort', cancel, { once: true });
    try {
      download = FS.createDownloadResumable(localModel.url, model.uri, {}, (p) =>
        onProgress(p.totalBytesWritten / localModel.bytes),
      );
      const result = await download.downloadAsync();
      if (signal.aborted || !result || result.status !== 200 || model.size !== localModel.bytes)
        throw new Error('Download cancelled or incomplete');
      const hash = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, await model.bytes());
      const hex = Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
      if (hex !== localModel.sha256) throw new Error('Model checksum mismatch');
      if (signal.aborted) throw new Error('Download cancelled');
      ready.write(hex);
    } catch (error) {
      if (model.exists) model.delete();
      throw error;
    } finally {
      signal.removeEventListener('abort', cancel);
      download = null;
    }
  },
  async remove() {
    if (model.exists) model.delete();
    if (ready.exists) ready.delete();
  },
  async classify(text, signal) {
    const { initLlama } = await import('llama.rn');
    const active = await initLlama({
      model: model.uri,
      n_ctx: 1024,
      n_threads: 1,
      n_gpu_layers: 0,
    });
    if (signal.aborted) {
      await active.release();
      throw new Error('Stopped');
    }
    context = active;
    const result = await active.completion({
      messages: [{ role: 'user', content: localModel.prompt + text }],
      n_predict: 8,
      grammar: 'root ::= "OBSERVATION" | "PRIVATE" | "UNSUPPORTED"',
      temperature: 0,
    });
    return result.text;
  },
  stop() {
    void context?.stopCompletion();
  },
  async unload() {
    if (context) {
      const active = context;
      context = null;
      await active.release();
    }
  },
});
AppState.addEventListener('change', (state) => {
  if (state !== 'active') localAI.stop();
});
