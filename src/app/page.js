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
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token from localStorage
    router.push("/login"); // Redirect to login page after logout
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