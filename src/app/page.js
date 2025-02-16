"use client";

import { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import Header from "../../components/layout/Header";
import withAuth from "../../components/utils/withAuth"; // Import the HOC
import styles from "./Home.module.css";

function Home() {
  const router = useRouter();

  useEffect(() => {
    // Get the token from localStorage
    const token = localStorage.getItem("token");

    if (token) {
      // Decode token to get user role
      const user = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
      const role = user?.role;

      // Redirect customer to their dashboard
      if (role === "Customer") {
        router.push("/dashboard/customer");
      }
      if (role === "RestaurantOwner") {
        router.push("/dashboard/restaurantOwner");
      }
      if (role === "FoodSafetyOfficeUser") {
        router.push("/dashboard/foodSafety");
      }
    }
  }, [router]);

  // Logout function
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

  return (
    <div className={styles.container}>
      <Head>
        <title>Trust Bite - Home</title>
        <meta name="description" content="Ensuring Safe Dining Experiences" />
      </Head>
      <Header />
    </div>
  );
}

// Wrap Home with withAuth to enforce authentication
export default withAuth(Home);