'use client';

import {
  useEffect,
  useRef,
} from 'react';

import { socket } from '../lib/socket';

import { useWebRTC } from '../hooks/useWebRTC';

export default function CallPage() {
  const localVideo =
    useRef<HTMLVideoElement>(
      null,
    );

  const remoteVideo =
    useRef<HTMLVideoElement>(
      null,
    );

  const {
    initialize,
    createOffer,
    localStream,
    remoteStream,
  } = useWebRTC();

  useEffect(() => {
    socket.connect();

    initialize().then(
      (stream) => {
        if (
          localVideo.current
        ) {
          localVideo.current.srcObject =
            stream;
        }
      },
    );
  }, []);

  useEffect(() => {
    if (
      remoteVideo.current &&
      remoteStream
    ) {
      remoteVideo.current.srcObject =
        remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="p-10">
      <h1>
        BlueJoinet Test Client
      </h1>

      <div className="flex gap-5">
        <video
          ref={localVideo}
          autoPlay
          muted
          playsInline
          className="w-96 border"
        />

        <video
          ref={remoteVideo}
          autoPlay
          playsInline
          className="w-96 border"
        />
      </div>

      <button
        onClick={
          createOffer
        }
        className="mt-5 bg-black text-white px-4 py-2"
      >
        Start Call
      </button>
    </div>
  );
}