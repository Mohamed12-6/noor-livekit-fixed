import { AccessToken } from 'livekit-server-sdk';

// LiveKit Cloud config — keys live ONLY on the server (.env), never shipped to the client.
// NEXT_PUBLIC_LIVEKIT_URL is the single value the browser needs (the wss:// URL).
export function livekitConfigured(): boolean {
  return Boolean(
    process.env.LIVEKIT_API_KEY &&
    process.env.LIVEKIT_API_SECRET &&
    process.env.NEXT_PUBLIC_LIVEKIT_URL,
  );
}

export async function createLiveKitToken(identity: string, room: string, name?: string): Promise<string> {
  const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity,
    name,
    ttl: 60 * 60, // 1 hour
  });
  at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });
  return at.toJwt();
}
