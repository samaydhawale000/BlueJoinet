"use client";

import { useEffect, useRef, useState } from "react";
import { connectSocket, socket } from "../../lib/socket";

export default function CallTestPage() {
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);

  const localStream = useRef<MediaStream | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const [token, setToken] = useState("");
  const [callId, setCallId] = useState("");

  const [status, setStatus] = useState("Idle");
  const [callState, setCallState] = useState<
    "IDLE" | "RINGING" | "IN_CALL" | "REJECTED" | "ENDED"
  >("IDLE");

  const [isIncoming, setIsIncoming] = useState(false);

  const incomingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);


  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // -------------------------
  // TIMER
  // -------------------------
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setCallDuration(0);
  };

  // -------------------------
  // SOCKET AUTH
  // -------------------------
  async function connectAndAuthenticate() {
    if (!socket.connected) connectSocket();

    const auth = await socket.emitWithAck("authenticate", {
      token,
    });

    if (!auth.success) {
      setStatus("Auth Failed");
      return;
    }

    setStatus(`Authenticated (${auth.role})`);
  }

  // -------------------------
  // JOIN CALL
  // -------------------------
  async function joinCall() {
    const result = await socket.emitWithAck("join-call", {
      callId,
    });

    if (!result.success) {
      setStatus("Join Failed");
      return;
    }

    setStatus(`Joined Call (${result.participants})`);
  }

  // -------------------------
  // CAMERA + PEER
  // -------------------------
  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStream.current = stream;

    if (localVideo.current) {
      localVideo.current.srcObject = stream;
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
      ],
    });

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // -------------------------
    // ⭐ IMPORTANT FIX: REMOTE STREAM ATTACH
    // -------------------------
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];

      if (remoteVideo.current) {
        remoteVideo.current.srcObject = remoteStream;
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
        });
      }
    };

    peerConnection.current = pc;

    setStatus("Camera Ready");
  }

  // -------------------------
  // CALL INITIATOR
  // -------------------------
  async function startCall() {
    if (!peerConnection.current) {
      alert("Start Camera First");
      return;
    }

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.emit("offer", { offer });

    setCallState("RINGING");
    setStatus("Calling...");
  }

  // -------------------------
  // ACCEPT CALL
  // -------------------------
  async function acceptCall(offer: RTCSessionDescriptionInit) {
    if (!peerConnection.current) return;

    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    const answer = await peerConnection.current.createAnswer();

    await peerConnection.current.setLocalDescription(answer);

    socket.emit("answer", { answer });

    setCallState("IN_CALL");
    startTimer();
    setIsIncoming(false);
  }

  // -------------------------
  // END CALL
  // -------------------------
  function endCall() {
    // Tell remote peer to end
    socket.emit("call-ended", {});

    // Leave our room to avoid participant count inflation
    if (callId) {
      socket.emit("leave-call", { callId });
    }

    peerConnection.current?.close();
    peerConnection.current = null;

    stopTimer();
    setCallState("ENDED");
    setStatus("Call Ended");
  }

  // -------------------------
  // SOCKET EVENTS
  // -------------------------
  useEffect(() => {
    // incoming call
    socket.on("offer", async ({ offer }) => {
      setIsIncoming(true);
      setCallState("RINGING");

      // store incoming offer until user clicks Accept Call
      incomingOfferRef.current = offer;

    });

    socket.on("answer", async ({ answer }) => {
      if (!peerConnection.current) return;

      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );

      setCallState("IN_CALL");
      startTimer();
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (!peerConnection.current) return;

      try {
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (e) {
        console.log("ICE error", e);
      }
    });

    socket.on("call-ended", () => {
      peerConnection.current?.close();
      peerConnection.current = null;

      stopTimer();
      setCallState("ENDED");
      setStatus("Other user ended call");
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("call-ended");
    };
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">BlueJoinet Call Test (PRO)</h1>

      {/* INPUTS */}
      <input
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Session Token"
        className="border p-2 w-full mb-2"
      />

      <input
        value={callId}
        onChange={(e) => setCallId(e.target.value)}
        placeholder="Call ID"
        className="border p-2 w-full mb-2"
      />

      {/* BUTTONS */}
      <div className="flex gap-2 flex-wrap mb-4">
        <button onClick={connectAndAuthenticate} className="bg-black text-white px-3 py-2">
          Auth
        </button>

        <button onClick={joinCall} className="bg-blue-600 text-white px-3 py-2">
          Join
        </button>

        <button onClick={startCamera} className="bg-green-600 text-white px-3 py-2">
          Camera
        </button>

        <button onClick={startCall} className="bg-red-600 text-white px-3 py-2">
          Call
        </button>

        {/* ACCEPT CALL */}
        {isIncoming && (
          <button
            onClick={() => {
              if (incomingOfferRef.current) {
                acceptCall(incomingOfferRef.current);
              }
            }}

            className="bg-purple-600 text-white px-3 py-2"
          >
            Accept Call
          </button>
        )}

        {/* END CALL */}
        <button onClick={endCall} className="bg-gray-800 text-white px-3 py-2">
          End
        </button>
      </div>

      {/* STATUS */}
      <div className="mb-3">
        <p>Status: {status}</p>
        <p>Call State: {callState}</p>
        <p>Duration: {callDuration}s</p>
      </div>

      {/* VIDEO */}
      <div className="flex gap-5">
        <video ref={localVideo} autoPlay muted playsInline className="w-[400px] border" />
        <video ref={remoteVideo} autoPlay playsInline className="w-[400px] border" />
      </div>
    </div>
  );
}