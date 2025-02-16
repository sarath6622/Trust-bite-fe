"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import styles from "./Header.module.css";
import NotificationBell from "../NotificationBell";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [restaurantExists, setRestaurantExists] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userName, setUserName] = useState("");
  const [notifications, setNotifications] = useState([]); // ✅ Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const user = JSON.parse(atob(token.split(".")[1]));
      setUserRole(user.role);
      setUserName(user.name);

      if (user.role === "RestaurantOwner") {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/owner`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRestaurantExists(!!response.data.restaurant);
      }
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      setRestaurantExists(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token from localStorage
    router.push("/login"); // Redirect to login page after logout
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data.notifications);
      console.log(response.data.notifications);
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchNotifications(); // ✅ Fetch notifications
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo & Title */}
        <Link href="/" className={styles.logoContainer}>
          <Image src="/logo.png" alt="Trust Bite Logo" width={50} height={50} />
          <h1 className={styles.logoText}>Trust Bite</h1>
        </Link>

        {/* Navigation Links */}
        <nav className={styles.navbar}>
          <ul className={styles.navList}>
            <li><Link href="/" className={pathname === "/" ? styles.active : ""}>Home</Link></li>
            {userRole === "FoodSafetyOfficeUser" && (
              <li><Link href="/complaints/manage" className={pathname === "/complaints/manage" ? styles.active : ""}>Manage Complaints</Link></li>
            )}
            <li><Link href="/complaints" className={pathname === "/complaints" ? styles.active : ""}>Complaints</Link></li>
            <li><Link href="/restaurants" className={pathname === "/restaurants" ? styles.active : ""}>Restaurants</Link></li>
          </ul>
        </nav>

        {/* Profile Dropdown */}
        <div className={styles.profileContainer} ref={dropdownRef}>
          <button className={styles.profileButton} onClick={() => setShowDropdown((prev) => !prev)}>
            <Image src="/user-icon.png" alt="Profile" width={30} height={30} />
          </button>

          {showDropdown && (
            <div className={styles.dropdown}>
              <p className={styles.userName}>{userName}</p>
              <button onClick={handleLogout}  className={styles.logoutButton}>Logout</button>
            </div>
          )}
        </div>

        <div className={styles.notificationContainer}>

          <NotificationBell notifications={notifications} />
        </div>


      </div>
    </header>
  );
}