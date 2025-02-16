"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Header from "../../../components/layout/Header"; // Reusable Header
// import Footer from "../../../components/layout/Footer";

import styles from "./Complaints.module.css";
import withAuth from "../../../components/utils/withAuth";

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // Error state
  const router = useRouter();

  // Fetch user's submitted complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token missing. Please log in.");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/my-complaints`, { headers });

        if (!response.data.complaints || response.data.complaints.length === 0) {
          setError("You haven't submitted any complaints yet.");
          return;
        }

        setComplaints(response.data.complaints);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setError("You haven't submitted any complaints yet.");
        } else {
          console.error("❌ Error fetching complaints:", error.response?.data || error.message);
          setError("Failed to fetch complaints. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  if (loading) return <p className={styles.loading}>Loading your complaints...</p>;

  return (
    <div className={styles.container}>
      <Head>
        <title>My Complaints - Trust Bite</title>
        <meta name="description" content="Track the complaints you have raised for restaurants" />
      </Head>

      <Header />

      <main className={styles.main}>
        <h2>My Complaints</h2>

        {error ? (
          <p className={styles.noComplaints}>{error}</p>
        ) : (
          <div className={styles.complaintList}>
            {complaints.map((complaint) => (
              <div
                key={complaint._id}
                className={styles.complaintCard}
                onClick={() => router.push(`/complaints/${complaint._id}`)}
              >
              
                <h3>{complaint.restaurant.name}</h3>
                <p className={styles.issue}>Issue: {complaint.message}</p>
                <p className={styles.status}>
                  Status: <span className={styles[complaint.status.toLowerCase()]}>{complaint.status}</span>
                </p>
                <p className={styles.comment}>{complaint.comment}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* <Footer /> */}
    </div>
  );
}

export default withAuth(MyComplaints);