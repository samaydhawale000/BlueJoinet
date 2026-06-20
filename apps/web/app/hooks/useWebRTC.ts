"use client";

import { useEffect, useRef, useState } from "react";

import { socket } from "../lib/socket";

export function useWebRTC() {
  const peerConnection =
    useRef<RTCPeerConnection | null>(null);

  const localStream =
    useRef<MediaStream | null>(null);

  const [remoteStream, setRemoteStream] =
    useState<MediaStream | null>(null);

  async function initialize() {
    const stream =
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

    localStream.current = stream;

    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls:
            "stun:stun.l.google.com:19302",
        },
      ],
    });

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    pc.ontrack = (event) => {
      const stream = event.streams[0];

      setRemoteStream(stream);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
        });
      }
    };

    peerConnection.current = pc;

    return stream;
  }

  async function createOffer() {
    if (!peerConnection.current) return;

    const offer =
      await peerConnection.current.createOffer();

    await peerConnection.current.setLocalDescription(
      offer
    );

    socket.emit("offer", {
      offer,
    });
    
  }

  async function handleOffer(
    payload: {
      offer: RTCSessionDescriptionInit;
    }
  ) {
    if (!peerConnection.current) return;

    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(
        payload.offer
      )
    );

    const answer =
      await peerConnection.current.createAnswer();

    await peerConnection.current.setLocalDescription(
      answer
    );

    socket.emit("answer", {
      answer,
    });
  }

  async function handleAnswer(
    payload: {
      answer: RTCSessionDescriptionInit;
    }
  ) {
    if (!peerConnection.current) return;

    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(
        payload.answer
      )
    );
  }

  async function handleIceCandidate(
    payload: {
      candidate: RTCIceCandidateInit;
    }
  ) {
    if (!peerConnection.current) return;

    await peerConnection.current.addIceCandidate(
      new RTCIceCandidate(
        payload.candidate
      )
    );
  }

  useEffect(() => {
    socket.on(
      "offer",
      handleOffer
    );

    socket.on(
      "answer",
      handleAnswer
    );

    socket.on(
      "ice-candidate",
      handleIceCandidate
    );

    return () => {
      socket.off(
        "offer",
        handleOffer
      );

      socket.off(
        "answer",
        handleAnswer
      );

      socket.off(
        "ice-candidate",
        handleIceCandidate
      );
    };
  }, []);

  return {
    initialize,
    createOffer,
    localStream,
    remoteStream,
  };
}