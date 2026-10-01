import { db } from './db';

export async function getSettings() {
  let settings = await db.settings.findUnique({ where: { id: 'main' } });
  if (!settings) settings = await db.settings.create({ data: { id: 'main' } });
  return settings;
}

export const PRESENCE_WINDOW_MS = 70_000;

export function isPresent(t: { isOnline: boolean; lastSeenAt: Date }) {
  return t.isOnline && Date.now() - t.lastSeenAt.getTime() < PRESENCE_WINDOW_MS;
}
