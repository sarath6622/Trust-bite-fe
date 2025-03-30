"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import withAuth from "../../../../components/utils/withAuth";
import styles from "../Dashboard.module.css";
import Header from "../../../../components/layout/Header";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

function FoodSafetyOfficerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🛑 All sections collapsed by default
  const [showComplaints, setShowComplaints] = useState({
    Submitted: false,
    Acknowledged: false,
    "Action Taken": false,
    Resolved: false,
  });

  const router = useRouter();

  // ⭐ Format date for display
  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options).replace(",", "");
  };

  // 🔥 Fetch complaints
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("❌ No token found.");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch complaints
        const complaintsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/all-complaints`,
          { headers }
        );

        const sortedComplaints = complaintsRes.data.complaints.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setComplaints(sortedComplaints);
      } catch (error) {
        console.error("❌ Error fetching complaints:", error.response ? error.response.data : error);
        setError("Failed to fetch complaints. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ⭐ Handle navigation on click
  const handleComplaintClick = (complaintId) => {
    router.push(`/complaints/${complaintId}`);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Header />
      <div className={styles.container}>
        <h2 className={styles.title}>Food Safety Officer Dashboard</h2>

        {/* 🔹 Complaint Status Count Cards */}
        <div className={styles.statsContainer}>
          {["Submitted", "Acknowledged", "Action Taken", "Resolved"].map((status) => (
            <div key={status} className={styles.statsCard}>
              <h4>{status}</h4>
              <p className={styles.statsNumber}>
                {complaints.filter((c) => c.status === status).length}
              </p>
            </div>
          ))}
        </div>

        {/* 🔹 Complaints Section (Collapsible - All collapsed by default) */}
        {["Submitted", "Acknowledged", "Action Taken", "Resolved"].map((status) => {
          const complaintsByStatus = complaints.filter((c) => c.status === status);

          return (
            <div key={status} className={styles.section}>
              <div
                className={styles.sectionHeader}
                onClick={() =>
                  setShowComplaints({
                    ...showComplaints,
                    [status]: !showComplaints[status],
                  })
                }
              >
                <h3>
                  {status} Complaints ({complaintsByStatus.length})
                </h3>
                {showComplaints[status] ? <FaChevronUp /> : <FaChevronDown />}
              </div>

              <div className={styles.complaintList}>
              {showComplaints[status] && (
                complaintsByStatus.length === 0 ? (
                  <p>No {status.toLowerCase()} complaints.</p>
                ) : (

                  complaintsByStatus.map((complaint) => (
                    <div
                      key={complaint._id}
                      className={styles.complaintCard}
                      onClick={() => handleComplaintClick(complaint._id)}
                      style={{ cursor: "pointer" }}  // Clickable with pointer cursor
                    >
                      <p><strong>Summary:</strong> {complaint.message || "No message available"}</p>
                      <p><strong>User:</strong> {complaint.user || "Anonymous"}</p>
                      <p><strong>Restaurant:</strong> {complaint.restaurant?.name || "Unknown"}</p>
                      <p><strong>Date:</strong> {formatDate(complaint.createdAt)}</p>
                    </div>
                  ))
                )
                
              )}
            </div>

              
            </div>
          );
        })}
      </div>
    </>
  );
}

export default withAuth(FoodSafetyOfficerDashboard);