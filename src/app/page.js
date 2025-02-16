"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation"; 
import Header from "../../components/layout/Header";
// import Footer from "../../components/layout/Footer";
import { usePathname } from "next/navigation";
import withAuth from "../../components/utils/withAuth"; // Import the HOC
import styles from "./Home.module.css";

function Home() {
  const pathname = usePathname();
  const router = useRouter();

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

      <main className={styles.main}>
        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
      </main>

      {/* <Footer /> */}

    </div>
  );
}

// Wrap Home with withAuth to enforce authentication
export default withAuth(Home);