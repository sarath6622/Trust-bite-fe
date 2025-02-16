"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import withAuth from "../../../../components/utils/withAuth";
import styles from "../Dashboard.module.css";
import Header from "../../../../components/layout/Header";
import { FaChevronDown, FaChevronUp, FaUserShield } from "react-icons/fa";

function FoodSafetyOfficerDashboard() {
  const [complaints, setComplaints] = useState({
    Submitted: [],
    Acknowledged: [],
    "Action Taken": [],
    Resolved: [],
  });
  const [loading, setLoading] = useState(true);
  const [showComplaints, setShowComplaints] = useState({
    Submitted: true,
    Acknowledged: true,
    "Action Taken": true,
    Resolved: true,
  });

  const router = useRouter();

  // ⭐ Format date
  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options).replace(",", "");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔹 Fetching food safety officer complaints...");
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("❌ No token found.");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all complaints for Food Safety Officer
        const complaintsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/all-complaints`,
          { headers }
        );

        // Group complaints by status
        const groupedComplaints = {
          Submitted: [],
          Acknowledged: [],
          "Action Taken": [],
          Resolved: [],
        };

        complaintsRes.data.complaints.forEach((complaint) => {
          if (groupedComplaints[complaint.status]) {
            groupedComplaints[complaint.status].push(complaint);
          }
        });

        setComplaints(groupedComplaints);
      } catch (error) {
        console.error("❌ Error fetching complaints:", error.response ? error.response.data : error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Header />
      <div className={styles.container}>
        <h2 className={styles.title}>Food Safety Officer Dashboard</h2>

        {/* 🔹 Complaint Status Count Cards */}
        <div className={styles.statsContainer}>
          {Object.keys(complaints).map((status) => (
            <div key={status} className={styles.statsCard}>
              <h4>{status}</h4>
              <p className={styles.statsNumber}>{complaints[status].length}</p>
            </div>
          ))}
        </div>

        {/* 🔹 Complaints Section (Collapsible) */}
        {Object.keys(complaints).map((status) => (
          <div key={status} className={styles.section}>
            <div
              className={styles.sectionHeader}
              onClick={() => setShowComplaints({ ...showComplaints, [status]: !showComplaints[status] })}
            >
              <h3>{status} Complaints ({complaints[status].length})</h3>
              {showComplaints[status] ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {showComplaints[status] && (
              complaints[status].length === 0 ? (
                <p>No {status.toLowerCase()} complaints.</p>
              ) : (
                complaints[status].map((complaint) => (
                  <div key={complaint._id} className={styles.card}>
                    <p><strong>Message:</strong> {complaint.message || "No message available"}</p>
                    <p><strong>User:</strong> {complaint.user?.email || "Anonymous"}</p>
                    <p><strong>Restaurant:</strong> {complaint.restaurant?.name || "Unknown"}</p>
                    <p><strong>Date:</strong> {formatDate(complaint.createdAt)}</p>
                  </div>
                ))
              )
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default withAuth(FoodSafetyOfficerDashboard);