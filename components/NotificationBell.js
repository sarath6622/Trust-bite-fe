import { useState, useRef, useEffect } from "react";
import styles from "./Notification.module.css"; // Import CSS Module

const NotificationBell = ({ notifications }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const bellRef = useRef(null);
  const dropdownRef = useRef(null);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
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
        {notifications.length > 0 && (
          <span className={styles.notificationCount}>{notifications.length}</span>
        )}
        <img src="/bell-icon.png" alt="Notifications" className={styles.bellIcon} />
      </div>

      {/* Dropdown Panel */}
      <div
        className={`${styles.notificationDropdown} ${showDropdown ? styles.active : ""}`}
        ref={dropdownRef}
      >
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div key={index} className={styles.notificationItem}>
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