'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { socket } from '../lib/socket';
import { api } from '../lib/api';

type CallState =
  | 'connecting'
  | 'waiting'
  | 'incoming'
  | 'in-call'
  | 'rejected'
  | 'ended'
  | 'error';

interface IncomingCallData {
  callId: string;
  callerId: string;
  type: 'AUDIO' | 'VIDEO';
}

function CallPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const urlCallId = searchParams.get('callId');

  const [state, setState] = useState<CallState>('connecting');
  const [incomingData, setIncomingData] = useState<IncomingCallData | null>(
    null,
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const stateRef = useRef<CallState>('connecting');

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  async function initMedia(video = true) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video,
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => setRemoteStream(event.streams[0]);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { candidate: event.candidate });
      }
    };

    pcRef.current = pc;
  }

  async function createOffer() {
    if (!pcRef.current) return;
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    socket.emit('offer', { offer });
  }

  function cleanup() {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current = null;
  }

  useEffect(() => {
    if (!token || !urlCallId) {
      setState('error');
      return;
    }

    socket.on('incoming-call', (data: IncomingCallData) => {
      setIncomingData(data);
      setState('incoming');
    });

    socket.on('call-accepted', async () => {
      await initMedia();
      setState('in-call');
      await createOffer();
    });

    socket.on('call-rejected', () => setState('rejected'));

    socket.on(
      'offer',
      async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
        if (!pcRef.current) return;
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(offer),
        );
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socket.emit('answer', { answer });
      },
    );

    socket.on(
      'answer',
      async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
        if (!pcRef.current) return;
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(answer),
        );
      },
    );

    socket.on(
      'ice-candidate',
      async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        if (!pcRef.current) return;
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      },
    );

    socket.on('call-ended', () => {
      if (stateRef.current === 'ended') return;
      cleanup();
      setState('ended');
    });

    socket.on('connect', () => {
      socket.emit(
        'authenticate',
        { token },
        (response: { success: boolean; role: string }) => {
          if (!response?.success) {
            setState('error');
            return;
          }
          if (response.role === 'CALLER') {
            setState('waiting');
          }
          // RECEIVER: incoming-call socket event sets the state
        },
      );
    });

    socket.connect();

    return () => {
      [
        'incoming-call',
        'call-accepted',
        'call-rejected',
        'offer',
        'answer',
        'ice-candidate',
        'call-ended',
        'connect',
      ].forEach((e) => socket.off(e));
      socket.disconnect();
      cleanup();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  async function acceptCall() {
    if (!incomingData) return;
    await initMedia(incomingData.type === 'VIDEO');
    await api.post(`/calls/${incomingData.callId}/accept`);
    setState('in-call');
  }

  async function rejectCall() {
    if (!incomingData) return;
    await api.post(`/calls/${incomingData.callId}/reject`);
    setState('rejected');
  }

  async function endCall() {
    if (!urlCallId) return;
    socket.emit('call-ended');
    await api.post(`/calls/${urlCallId}/end`).catch(() => {});
    cleanup();
    setState('ended');
  }

  function toggleMute() {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsMuted(!track.enabled);
  }

  function toggleVideo() {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsVideoOff(!track.enabled);
  }

  if (!token || !urlCallId || state === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white text-xl">Invalid call link.</p>
      </div>
    );
  }

  if (state === 'connecting') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white text-lg">Connecting...</p>
      </div>
    );
  }

  if (state === 'waiting') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-xl">Waiting for the other person to join...</p>
        </div>
      </div>
    );
  }

  if (state === 'incoming') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-white">
          <p className="text-3xl font-semibold mb-2">
            Incoming {incomingData?.type === 'VIDEO' ? 'Video' : 'Audio'} Call
          </p>
          <p className="text-gray-400 mb-10 text-lg">{incomingData?.callerId}</p>
          <div className="flex gap-8 justify-center">
            <button
              onClick={acceptCall}
              className="w-20 h-20 bg-green-500 hover:bg-green-400 rounded-full text-white font-medium text-sm transition-colors"
            >
              Accept
            </button>
            <button
              onClick={rejectCall}
              className="w-20 h-20 bg-red-500 hover:bg-red-400 rounded-full text-white font-medium text-sm transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'rejected') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white text-xl">Call was declined.</p>
      </div>
    );
  }

  if (state === 'ended') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white text-xl">Call ended.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover bg-gray-800"
        />
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="absolute bottom-4 right-4 w-48 h-36 object-cover rounded-xl border-2 border-gray-600 bg-gray-700"
        />
      </div>

      <div className="flex justify-center gap-4 p-5 bg-gray-800">
        <button
          onClick={toggleMute}
          className={`px-6 py-3 rounded-full font-medium text-white transition-colors ${
            isMuted
              ? 'bg-red-500 hover:bg-red-400'
              : 'bg-gray-600 hover:bg-gray-500'
          }`}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button
          onClick={toggleVideo}
          className={`px-6 py-3 rounded-full font-medium text-white transition-colors ${
            isVideoOff
              ? 'bg-red-500 hover:bg-red-400'
              : 'bg-gray-600 hover:bg-gray-500'
          }`}
        >
          {isVideoOff ? 'Camera On' : 'Camera Off'}
        </button>
        <button
          onClick={endCall}
          className="px-8 py-3 rounded-full font-medium text-white bg-red-600 hover:bg-red-500 transition-colors"
        >
          End Call
        </button>
      </div>
    </div>
  );
}

export default function CallPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <p className="text-white">Loading...</p>
        </div>
      }
    >
      <CallPageContent />
    </Suspense>
  );
}
