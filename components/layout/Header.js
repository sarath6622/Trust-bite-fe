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
  const [notifications, setNotifications] = useState([]);
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
      console.log(user);

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

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
  
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      localStorage.removeItem("token"); // Clear token
      router.push("/login"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchNotifications();
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
            {userRole === "Customer" && ( <li><Link href="/dashboard/customer" className={pathname === "/dashboard/customer" ? styles.active : ""}>Home</Link></li>)}
            {userRole === "RestaurantOwner" && ( <li><Link href="/dashboard/restaurantOwner" className={pathname === "/dashboard/restaurantOwner" ? styles.active : ""}>Home</Link></li>)}
            {userRole === "Admin" && ( <li><Link href="/dashboard/admin" className={pathname === "/dashboard/restaurantOwner" ? styles.active : ""}>Home</Link></li>)}
            {userRole === "FoodSafetyOfficeUser" && ( <li><Link href="/complaints/manage" className={pathname === "/complaints/manage" ? styles.active : ""}>Manage Complaints</Link></li>)}
            <li><Link href="/complaints" className={pathname === "/complaints" ? styles.active : ""}>Complaints</Link></li>
            <li><Link href="/restaurants" className={pathname === "/restaurants" ? styles.active : ""}>Restaurants</Link></li>
            {userRole === "RestaurantOwner" && ( <li><Link href="/restaurants/manage" className={pathname === "/dashboard/restaurantOwner" ? styles.active : ""}>Manage Restaurant</Link></li>)}

        
            {/* Notifications */}
            <div className={styles.profileButton}>
                <NotificationBell notifications={notifications} />
            </div>

            {/* Profile Dropdown */}
            <div className={styles.profileContainer}>
              {/* Profile Icon & Username */}
             
                  <div className={styles.profiledata}>
                  <p className={styles.userName}> {userName}</p>
                  <p className={styles.userRole}> {userRole}</p>

                  </div>
                  <Image src="/user-icon.png" alt="Profile" width={30} height={30} />
            </div>
                  <svg 
                    onClick={handleLogout} 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="30" 
                    height="30" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    style={{ cursor: "pointer" }}
                  >
                    <path d="M9 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
          </ul>
        </nav>
      </div>
    </header>
  );
}