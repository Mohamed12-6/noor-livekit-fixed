'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Phone, PhoneCall, Video, X } from 'lucide-react';
import { useUi } from './ui-context';

export type CallTeacher = { id: string; name: string; nameAr: string; initials: string };

type Phase = 'idle' | 'ringing' | 'incoming' | 'connecting' | 'active' | 'ended';
type Signal = { id?: string | number; type: string; payload: string };

// Module-level so it never changes between renders.
// For mobile networks (CGNAT) add a TURN server here, e.g.
// { urls: 'turn:your.turn.server:3478', username: '...', credential: '...' }
const ICE: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function CallOverlay({
  role, teacher, callId, onEnd,
}: {
  role: 'student' | 'teacher';
  teacher: CallTeacher;
  callId: string;
  onEnd: () => void;
}) {
  const { language } = useUi();
  const [phase, setPhase] = useState<Phase>(role === 'teacher' ? 'incoming' : 'ringing');
  const [muted, setMuted] = useState(false);
  const [err, setErr] = useState('');

  // Keep the latest onEnd without making it a dependency of any effect/callback.
  const onEndRef = useRef(onEnd);
  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);

  const startedRef = useRef(false); // media connection started once only
  const endedRef = useRef(false);   // call finished once only

  // Shared video elements (used by both LiveKit and P2P)
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // LiveKit refs
  const roomRef = useRef<any>(null);
  const remoteTrackRef = useRef<any>(null);
  const audioElsRef = useRef<HTMLMediaElement[]>([]);

  // P2P refs
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pollRef = useRef<number | null>(null);

  const name = language === 'ar' ? teacher.nameAr : teacher.name;

  const cleanup = useCallback(() => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    try { roomRef.current?.disconnect(); } catch { /* already gone */ }
    roomRef.current = null;
    remoteTrackRef.current = null;
    audioElsRef.current.forEach((el) => { try { el.remove(); } catch { /* noop */ } });
    audioElsRef.current = [];
    try { pcRef.current?.close(); } catch { /* noop */ }
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
  }, []);

  // Ends the call locally exactly once (used for remote hang-up / errors).
  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    cleanup();
    setPhase('ended');
    onEndRef.current();
  }, [cleanup]);

  const hangup = useCallback(async (status = 'ended') => {
    if (endedRef.current) return;
    endedRef.current = true;
    // tell the other side (P2P) before we close everything
    if (pcRef.current) {
      fetch('/api/calls/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, fromRole: role, type: 'bye', payload: '{}' }),
      }).catch(() => {});
    }
    cleanup();
    try {
      await fetch('/api/calls', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, status }),
      });
    } catch { /* best effort */ }
    setPhase('ended');
    onEndRef.current();
  }, [callId, cleanup, role]);

  // ---------- LiveKit mode ----------
  const connectLiveKit = useCallback(async () => {
    const { Room, RoomEvent, VideoPresets, Track } = await import('livekit-client');
    const res = await fetch('/api/calls/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callId, role }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.provider !== 'livekit' || !data.wsUrl) return false;

    const room = new Room({ videoCaptureDefaults: { resolution: VideoPresets.h540 } });
    setErr('');
    roomRef.current = room;

    const attachRemoteVideo = () => {
      if (remoteTrackRef.current && remoteVideoRef.current) {
        remoteTrackRef.current.attach(remoteVideoRef.current);
      }
    };

    const attachLocalPreview = () => {
      const pub: any = room.localParticipant.getTrackPublication(Track.Source.Camera);
      const localTrack = pub?.track ?? pub?.videoTrack;
      if (localTrack && localVideoRef.current) {
        localTrack.attach(localVideoRef.current);
      }
    };

    room.on(RoomEvent.TrackSubscribed, (track: any) => {
      if (track.kind === 'video') {
        remoteTrackRef.current = track;
        attachRemoteVideo();
      } else if (track.kind === 'audio') {
        const audioElement = track.attach();
        document.body.appendChild(audioElement);
        audioElsRef.current.push(audioElement);
      }
      setPhase('active');
    });

    room.on(RoomEvent.TrackUnsubscribed, (track: any) => {
      try { track.detach(); } catch { /* noop */ }
    });

    room.on(RoomEvent.LocalTrackPublished, attachLocalPreview);
    room.on(RoomEvent.ParticipantConnected, () => setPhase('active'));
    room.on(RoomEvent.ParticipantDisconnected, () => finish());
    room.on(RoomEvent.Disconnected, () => finish());

    try {
      await room.connect(data.wsUrl, data.token);
      await room.localParticipant.setCameraEnabled(true);
      await room.localParticipant.setMicrophoneEnabled(true);
    } catch (e) {
      try { room.disconnect(); } catch { /* noop */ }
      roomRef.current = null;
      throw e;
    }

    // Tracks that were already published before we joined
    room.remoteParticipants?.forEach((p: any) => {
      p.trackPublications?.forEach((pub: any) => {
        const t = pub.track;
        if (!t) return;
        if (t.kind === 'video') {
          remoteTrackRef.current = t;
          attachRemoteVideo();
        } else if (t.kind === 'audio') {
          const el = t.attach();
          document.body.appendChild(el);
          audioElsRef.current.push(el);
        }
      });
    });

    attachLocalPreview();
    setTimeout(attachLocalPreview, 500);
    setTimeout(attachLocalPreview, 1500);
    return true;
  }, [callId, role, finish]);

  // ---------- P2P fallback mode ----------
  const setupPeer = useCallback(async () => {
    const pc = new RTCPeerConnection(ICE);
    pcRef.current = pc;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      setPhase('active');
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') {
        setErr(language === 'ar' ? 'فشل الاتصال بين الطرفين.' : 'Peer connection failed.');
        finish();
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        fetch('/api/calls/signal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callId, fromRole: role, type: 'candidate', payload: JSON.stringify(event.candidate) }),
        }).catch(() => {});
      }
    };

    // Candidates that arrive before the remote description is set
    const pending: RTCIceCandidateInit[] = [];
    const flush = async () => {
      for (const c of pending.splice(0)) {
        try { await pc.addIceCandidate(c); } catch { /* ignore */ }
      }
    };

    const seen = new Set<string>();

    const handleSignal = async (s: Signal) => {
      const key = s.id != null ? String(s.id) : `${s.type}:${s.payload}`;
      if (seen.has(key)) return;
      seen.add(key);
      try {
        if (s.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(s.payload)));
          await flush();
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await fetch('/api/calls/signal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callId, fromRole: role, type: 'answer', payload: JSON.stringify(answer) }),
          });
          setPhase('active');
        } else if (s.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(s.payload)));
          await flush();
          setPhase('active');
        } else if (s.type === 'candidate') {
          const c = JSON.parse(s.payload);
          if (pc.remoteDescription) await pc.addIceCandidate(c);
          else pending.push(c);
        } else if (s.type === 'bye') {
          finish();
        }
      } catch { /* ignore */ }
    };

    let polling = false;
    pollRef.current = window.setInterval(async () => {
      if (polling) return; // never overlap polls
      polling = true;
      try {
        const res = await fetch(`/api/calls/signal?callId=${callId}&forRole=${role}`, { cache: 'no-store' });
        const data = await res.json();
        for (const s of data.signals || []) await handleSignal(s);
      } catch { /* next poll */ } finally {
        polling = false;
      }
    }, 1200);

    if (role === 'student') {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await fetch('/api/calls/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, fromRole: role, type: 'offer', payload: JSON.stringify(offer) }),
      });
    }
    return pc;
  }, [callId, role, language, finish]);

  // Start media once when entering 'connecting'
  useEffect(() => {
    if (phase !== 'connecting' || startedRef.current) return;
    startedRef.current = true;
    (async () => {
      let lkOk = false;
      try {
        lkOk = await connectLiveKit();
      } catch {
        lkOk = false;
      }
      if (endedRef.current) return;
      if (lkOk) {
        setPhase('active');
      } else {
        try {
          await setupPeer();
        } catch {
          setErr(language === 'ar'
            ? 'تعذر الاتصال. تأكد من السماح بالكاميرا والميكروفون ومن الإنترنت.'
            : 'Could not connect. Allow camera/microphone and check your connection.');
          if (!endedRef.current) {
            endedRef.current = true;
            cleanup();
            setPhase('ended');
            onEndRef.current();
          }
        }
      }
    })();
  }, [phase, connectLiveKit, setupPeer, language, cleanup]);

  useEffect(() => () => cleanup(), [cleanup]);

  // Make sure the remote video is attached once the element exists / phase changes
  useEffect(() => {
    if (remoteTrackRef.current && remoteVideoRef.current) {
      remoteTrackRef.current.attach(remoteVideoRef.current);
    }
  }, [phase]);

  // BOTH sides watch the call status until the call is active or ended.
  useEffect(() => {
    if (phase === 'active' || phase === 'ended') return;

    const iv = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/calls?id=${callId}`, { cache: 'no-store' });
        const data = await res.json();
        const status = data.call?.status;
        if (!status) return;

        if (status === 'ended' || status === 'declined') {
          finish();
          return;
        }

        if (role === 'student' && status === 'accepted') {
          setPhase((p) => (p === 'ringing' ? 'connecting' : p));
        }
      } catch { /* ignore */ }
    }, 1500);

    return () => window.clearInterval(iv);
  }, [role, callId, finish, phase]);

  const toggleMute = () => {
    const next = !muted;
    if (roomRef.current) {
      roomRef.current.localParticipant.setMicrophoneEnabled(!next);
      setMuted(next);
      return;
    }
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => (t.enabled = !next));
    setMuted(next);
  };

  return (
    <div className="call-overlay" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {phase === 'connecting' || phase === 'active' ? (
        <div className="call-videos" style={{ position: 'relative', width: '100%', height: '100%', display: 'flex' }}>
          <div className="call-video" style={{ width: '100%', height: '100%' }}>
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="call-video me" style={{ position: 'absolute', bottom: 20, right: 20, width: 140, height: 180, borderRadius: 12, overflow: 'hidden', border: '2px solid #fff' }}>
            <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {phase === 'connecting' && (
            <div className="call-status" style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', padding: '6px 16px', borderRadius: 20 }}>
              {language === 'ar' ? 'جارٍ الاتصال…' : 'Connecting…'}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="call-avatar">{teacher.initials}</div>
          <div className="call-name">{name}</div>
          <div className="call-status">
            {phase === 'ringing' && (language === 'ar' ? 'جارٍ الرنين…' : 'Ringing…')}
            {phase === 'incoming' && (language === 'ar' ? 'مكالمة واردة' : 'Incoming call')}
            {phase === 'ended' && (language === 'ar' ? 'انتهت المكالمة' : 'Call ended')}
          </div>
          {err && <div className="call-status" style={{ color: '#ffb3b3' }}>{err}</div>}
        </>
      )}

      <div className="call-actions">
        {phase === 'incoming' && (
          <button
            className="call-btn accept"
            aria-label="Accept"
            onClick={async () => {
              await fetch('/api/calls', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callId, status: 'accepted' }),
              }).catch(() => {});
              setPhase('connecting');
            }}
          >
            <PhoneCall size={22} />
          </button>
        )}
        {phase !== 'incoming' && phase !== 'ended' && (
          <button className="call-btn mute off" aria-label="Mute" onClick={toggleMute}>
            {muted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        )}
        {phase !== 'ended' && (
          <button className="call-btn decline" aria-label="Hang up" onClick={() => hangup('ended')}>
            <Phone size={22} style={{ transform: 'rotate(135deg)' }} />
          </button>
        )}
      </div>

      {phase === 'ended' && (
        <button className="button-primary" onClick={() => onEndRef.current()}>
          {language === 'ar' ? 'إغلاق' : 'Close'} <X size={13} />
        </button>
      )}
      <Video size={0} aria-hidden="true" style={{ display: 'none' }} />
    </div>
  );
}