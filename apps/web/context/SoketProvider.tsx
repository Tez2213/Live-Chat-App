"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface ChatMessage {
  message: string;
  userId?: string;
  username?: string;
  roomId?: string;
  timestamp: Date;
}

interface SocketProviderProps {
  children?: React.ReactNode;
}

interface ISocketContext {
  socket: Socket | null;
  isConnected: boolean;
  messages: ChatMessage[];
  sendMessage: (message: string, roomId?: string) => void;
  joinRoom: (roomId: string) => void;
  currentRoom: string | null;
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const state = useContext(SocketContext);
  if (!state) throw new Error(`Socket context is undefined`);
  return state;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    // Connect to the server
    const SOCKET_URL =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== "undefined" &&
      window.location.hostname === "192.168.137.1"
        ? "http://192.168.137.47:8000"
        : "http://localhost:8000");

    const _socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Set up event listeners
    _socket.on("connect", () => {
      console.log("Socket connected!", _socket.id);
      setIsConnected(true);
    });

    _socket.on("disconnect", () => {
      console.log("Socket disconnected!");
      setIsConnected(false);
    });

    _socket.on("message", (message: ChatMessage) => {
      console.log("Message received:", message);
      setMessages((prev) => [...prev, message]);
    });

    setSocket(_socket);

    // Clean up on unmount
    return () => {
      _socket.disconnect();
      setSocket(null);
    };
  }, []);

  // Function to send a message
  const sendMessage = useCallback(
    (message: string, roomId?: string) => {
      if (!socket || !isConnected) return;

      const messageData = {
        message,
        roomId: roomId || currentRoom,
        username: localStorage.getItem("chatUsername") || "Anonymous",
        // Add user id if you have auth
        // userId: currentUser?.id,
      };

      console.log("Sending message:", messageData);
      socket.emit("event:message", messageData);
    },
    [socket, isConnected, currentRoom]
  );

  // Function to join a room
  const joinRoom = useCallback(
    (roomId: string) => {
      if (!socket || !isConnected) return;

      // Leave current room if any
      if (currentRoom) {
        socket.emit("room:leave", currentRoom);
      }

      // Join new room
      socket.emit("room:join", roomId);
      setCurrentRoom(roomId);

      // Request message history for the room
      socket.emit("messages:history", roomId, (roomMessages: ChatMessage[]) => {
        setMessages(roomMessages);
      });
    },
    [socket, isConnected, currentRoom]
  );

  const value = {
    socket,
    isConnected,
    messages,
    sendMessage,
    joinRoom,
    currentRoom,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
