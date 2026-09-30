import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({ id: 'bookly' });

export function readJSON<T>(key: string): T | undefined {
  const raw = storage.getString(key);
  if (!raw) {
    return undefined;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export function writeJSON(key: string, value: unknown) {
  storage.set(key, JSON.stringify(value));
}
