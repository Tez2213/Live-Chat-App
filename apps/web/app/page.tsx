"use client";
import { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SoketProvider";
import { FiSend, FiUser, FiMoon, FiSun, FiSmile } from "react-icons/fi";
import styles from "./page.module.css";

export default function ChatPage() {
  const { sendMessage, messages, isConnected } = useSocket();
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [usernameSet, setUsernameSet] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage("");
      // Focus input after sending message
      inputRef.current?.focus();
    }
  };

  // Handle username submission
  const handleSetUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem("chatUsername", username);
      setUsernameSet(true);
    }
  };

  // Load username and theme from localStorage
  useEffect(() => {
    const savedUsername = localStorage.getItem("chatUsername");
    if (savedUsername) {
      setUsername(savedUsername);
      setUsernameSet(true);
    }

    const savedTheme = localStorage.getItem("chatTheme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    }

    // Apply theme class to document body
    if (isDarkMode) {
      document.documentElement.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
    }
  }, [isDarkMode]);

  // Toggle dark/light theme
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("chatTheme", newTheme ? "dark" : "light");
  };

  // Format timestamp
  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Calculate time difference for grouping messages
  const shouldShowTimestamp = (current: any, prev: any) => {
    if (!prev) return true;
    const currDate = new Date(current.timestamp);
    const prevDate = new Date(prev.timestamp);
    return currDate.getTime() - prevDate.getTime() > 5 * 60 * 1000; // 5 minutes
  };

  // If username is not set, show username form
  if (!usernameSet) {
    return (
      <div
        className={`${styles.usernameContainer} ${isDarkMode ? styles.dark : ""}`}
      >
        <div className={styles.usernameCard}>
          <div className={styles.logoContainer}>
            <svg
              className={styles.logo}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1>Welcome to ChatApp</h1>
          <p>Join the conversation with a username</p>
          <form onSubmit={handleSetUsername} className={styles.usernameForm}>
            <div className={styles.inputWrapper}>
              <FiUser className={styles.inputIcon} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                className={styles.usernameInput}
                maxLength={20}
                autoFocus
              />
            </div>
            <button type="submit" className={styles.usernameButton}>
              Start Chatting
            </button>
          </form>
          <button onClick={toggleTheme} className={styles.themeToggle}>
            {isDarkMode ? <FiSun /> : <FiMoon />}
            {isDarkMode ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.chatContainer} ${isDarkMode ? styles.dark : ""}`}>
      <header className={styles.chatHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.logoSmall}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1>Chat Room</h1>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.connectionStatus}>
            <span
              className={`${styles.statusDot} ${isConnected ? styles.connected : styles.disconnected}`}
            ></span>
            {isConnected ? "Connected" : "Disconnected"}
          </div>
          <button onClick={toggleTheme} className={styles.themeButton}>
            {isDarkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>
      </header>

      <div className={styles.chatArea} ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className={styles.emptyChat}>
            <div className={styles.emptyStateIcon}>
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.418 16.97 20 12 20C10.5 20 9.26 19.68 8 19.2L3 20L4.2 15.6C3.42 14.55 3 13.28 3 12C3 7.58203 7.03 4 12 4C16.97 4 21 7.58203 21 12Z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.username === username;
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const showTimestamp = shouldShowTimestamp(msg, prevMsg);
            const isSameUser = prevMsg && prevMsg.username === msg.username;
            const showHeader = !isSameUser || showTimestamp;

            return (
              <div key={index}>
                {showTimestamp && (
                  <div className={styles.timeIndicator}>
                    <span>{new Date(msg.timestamp).toLocaleString()}</span>
                  </div>
                )}
                <div
                  className={`${styles.messageContainer} 
                    ${isOwnMessage ? styles.ownMessage : styles.otherMessage}
                    ${!showHeader && styles.continuedMessage}`}
                >
                  <div className={styles.messageContent}>
                    {showHeader && (
                      <div className={styles.messageHeader}>
                        <span className={styles.username}>
                          {msg.username || "Anonymous"}
                        </span>
                        <span className={styles.timestamp}>
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    )}
                    <p className={styles.messageText}>{msg.message}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className={styles.messageForm}>
        <div className={styles.messageInputContainer}>
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className={styles.messageInput}
            autoFocus
          />
          <button type="button" className={styles.emojiButton}>
            <FiSmile />
          </button>
        </div>
        <button
          type="submit"
          className={styles.sendButton}
          disabled={!isConnected || !newMessage.trim()}
        >
          <FiSend />
        </button>
      </form>
    </div>
  );
}
