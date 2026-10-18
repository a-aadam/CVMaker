import { create } from 'zustand';
import type { WebWorkerMLCEngine } from '@mlc-ai/web-llm';

// The smallest Qwen build WebLLM ships. The f32 variant is for GPUs without shader-f16.
const MODEL_F16 = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';
const MODEL_F32 = 'Qwen2.5-0.5B-Instruct-q4f32_1-MLC';
const ENABLED_KEY = 'cvmaker.aiEnabled';

export type AiStatus = 'checking' | 'unsupported' | 'idle' | 'loading' | 'ready' | 'error';

interface AiState {
  status: AiStatus;
  enabled: boolean;
  progress: number;
  message: string;
  model: string;
  setEnabled: (v: boolean) => void;
}

function readEnabled(): boolean {
  try {
    return localStorage.getItem(ENABLED_KEY) !== 'false';
  } catch {
    return true;
  }
}

export const useAi = create<AiState>()((set) => ({
  status: 'checking',
  enabled: readEnabled(),
  progress: 0,
  message: '',
  model: MODEL_F16,
  setEnabled: (enabled) => {
    try {
      localStorage.setItem(ENABLED_KEY, String(enabled));
    } catch {
      /* storage unavailable */
    }
    set({ enabled });
  },
}));

let enginePromise: Promise<WebWorkerMLCEngine> | null = null;
let modelId = MODEL_F16;

async function detect(): Promise<void> {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<{ features: Set<string> } | null> } }).gpu;
  if (!gpu) {
    useAi.setState({ status: 'unsupported', message: 'This browser has no WebGPU, so AI features use the built-in rules instead.' });
    return;
  }
  try {
    const adapter = await gpu.requestAdapter();
    if (!adapter) throw new Error('No GPU adapter');
    modelId = adapter.features.has('shader-f16') ? MODEL_F16 : MODEL_F32;
    useAi.setState({ status: 'idle', model: modelId });
  } catch {
    useAi.setState({ status: 'unsupported', message: 'No usable GPU was found, so AI features use the built-in rules instead.' });
  }
}
const detected = detect();

/** True when AI is switched on and the device can run it. */
export async function aiAvailable(): Promise<boolean> {
  await detected;
  const { status, enabled } = useAi.getState();
  return enabled && status !== 'unsupported' && status !== 'error';
}

export function loadEngine(): Promise<WebWorkerMLCEngine> {
  if (enginePromise) return enginePromise;
  enginePromise = (async () => {
    await detected;
    useAi.setState({ status: 'loading', progress: 0, message: 'Preparing the AI model…' });
    const { CreateWebWorkerMLCEngine } = await import('@mlc-ai/web-llm');
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    const engine = await CreateWebWorkerMLCEngine(worker, modelId, {
      initProgressCallback: (p) => useAi.setState({ progress: p.progress, message: p.text }),
    });
    useAi.setState({ status: 'ready', progress: 1, message: 'AI model ready' });
    return engine;
  })().catch((err: unknown) => {
    enginePromise = null;
    useAi.setState({ status: 'error', message: `Couldn't load the AI model: ${String((err as Error)?.message ?? err)}` });
    throw err;
  });
  return enginePromise;
}

// WebLLM runs one generation at a time; queue calls so callers don't have to care.
let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

interface ChatOpts {
  system: string;
  user: string;
  maxTokens?: number;
  schema?: object;
}

async function chat({ system, user, maxTokens = 512, schema }: ChatOpts): Promise<string> {
  const engine = await loadEngine();
  return enqueue(async () => {
    const res = await engine.chat.completions.create({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.1,
      max_tokens: maxTokens,
      ...(schema ? { response_format: { type: 'json_object' as const, schema: JSON.stringify(schema) } } : {}),
    });
    return res.choices[0]?.message?.content ?? '';
  });
}

export async function chatJSON<T>(opts: ChatOpts & { schema: object }): Promise<T | null> {
  const raw = await chat(opts);
  try {
    return JSON.parse(raw) as T;
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]) as T;
    } catch {
      return null;
    }
  }
}

export const chatText = chat;
