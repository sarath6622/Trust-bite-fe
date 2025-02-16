"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

// Initialize socket outside the component to prevent multiple connections
const socket = io("http://localhost:5004", {
  autoConnect: false, // Prevents auto connection before useEffect runs
});

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Connect socket when component mounts
    socket.connect();

    const handleNewComplaint = (data) => {
      setNotifications((prev) => [...prev, data]);
    };

    const handleComplaintUpdated = (data) => {
      setNotifications((prev) => [...prev, data]);
    };

    socket.on("newComplaint", handleNewComplaint);
    socket.on("complaintUpdated", handleComplaintUpdated);

    return () => {
      socket.off("newComplaint", handleNewComplaint);
      socket.off("complaintUpdated", handleComplaintUpdated);
      socket.disconnect(); // Properly disconnect on unmount
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);