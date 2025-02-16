"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5004"); // Ensure this matches your backend port

export default function WebSocketTestPage() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket server:", socket.id);
    });

    socket.on("message", (data) => {
      console.log("📩 New message from server:", data);
      setMessages((prev) => [...prev, data]);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    socket.emit("message", "Hello from client!");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">WebSocket Test</h1>
      <button 
        className="mt-2 p-2 bg-blue-500 text-white rounded" 
        onClick={sendMessage}
      >
        Send Message
      </button>
      <div className="mt-4">
        <h2 className="font-bold">Messages:</h2>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
    </div>
  );
}