import { useState, useRef, useEffect } from "react";
import styles from "./Notification.module.css"; // Import CSS Module
import { useRouter } from "next/navigation";
import axios from 'axios';

const NotificationBell = ({ notifications }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const bellRef = useRef(null);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleNotificationClick = async (notification) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/notifications/${notification._id}/read`,
        {}, // Empty body, since we only update `isRead`
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Redirect to the complaint page
      router.push(`/complaints/${notification.referenceId}`);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.notificationBellContainer}>
      {/* Bell Icon - Toggle dropdown on click */}
      <div
        className={styles.notificationBell}
        ref={bellRef}
        onClick={toggleDropdown}
      >
      {notifications.filter(notification => !notification.isRead).length > 0 && (
        <span className={styles.notificationCount}>
          {notifications.filter(notification => !notification.isRead).length}
        </span>
      )}
        <img src="/bell-icon.png" alt="Notifications" className={styles.bellIcon} />
      </div>

      {/* Dropdown Panel */}
      <div
        className={`${styles.notificationDropdown} ${showDropdown ? styles.active : ""}`}
        ref={dropdownRef}
      >
      {notifications.filter(notification => !notification.isRead).length > 0 ? (
        notifications
          .filter(notification => !notification.isRead)
          .map((notification, index) => (
            <div key={index} className={styles.notificationItem} onClick={() => handleNotificationClick(notification)}>
              <p>{notification.message}</p>
              <span className={styles.timestamp}>
                {new Date(notification.createdAt).toLocaleString()}
              </span>
            </div>
          ))
      ) : (
        <div className={styles.noNotifications}>No new notifications</div>
      )}
      </div>
    </div>
  );
};

export default NotificationBell;