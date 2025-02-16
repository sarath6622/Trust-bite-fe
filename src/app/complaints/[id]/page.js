"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Header from "../../../../components/layout/Header";
import styles from "./ComplaintDetail.module.css"; // New CSS file

const statusSteps = ["Submitted", "Acknowledged", "Action Taken", "Resolved"];

function ComplaintDetail() {
  const { id } = useParams(); // Get complaint ID from URL
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [remark, setRemark] = useState("");
  const router = useRouter();

  // Fetch complaint details
  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token missing. Please log in.");
          return;
        }

        const user = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
        setUserRole(user.role);
        

        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/complaint/${id}`,
          { headers }
        );

        setComplaint(response.data);
      } catch (error) {
        console.error("❌ Error fetching complaint:", error.response?.data || error.message);
        setError("Failed to load complaint details.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  if (loading) return <p className={styles.loading}>Loading complaint details...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!complaint) return <p className={styles.error}>Complaint not found</p>;

  const currentStep = statusSteps.indexOf(complaint.status);

  // Generate next possible statuses (only forward movement)
  const nextStatuses = statusSteps.slice(currentStep + 1);
  console.log(nextStatuses.length);

  const handleStatusUpdate = async () => {
    try {
      if (!newStatus) {
        alert("Please select a status.");
        return;
      }
  
      if ((newStatus === "Action Taken" || newStatus === "Resolved") && !remark.trim()) {
        alert(`Please provide details about the work done before setting status to ${newStatus}.`);
        return;
      }
  
      const confirmation = window.confirm(`Are you sure you want to update the status to '${newStatus}'?`);
      if (!confirmation) return;
  
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
  
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/complaint/${id}/status`,
        { status: newStatus, remark },
        { headers }
      );
  
      console.log("✅ API Response:", response.data); // Log API success response
  
      // Update UI
      setComplaint((prev) => ({
        ...prev,
        status: newStatus,
        remark,
        activityLog: [...prev.activityLog, { status: newStatus, remark, timestamp: new Date() }]
      }));
  
      alert("Complaint status updated successfully!");
      setNewStatus("");
      setRemark("");
    } catch (error) {
      console.error("❌ Error updating status:", error);
  
      // Check if response exists
      if (error.response) {
        console.error("❌ API Error Response:", error.response.data);
        alert(`Error: ${error.response.data.message || "Unknown API error"}`);
      } else if (error.request) {
        console.error("❌ No Response from API:", error.request);
        alert("No response from server. Please try again.");
      } else {
        console.error("❌ Client Error:", error.message);
        alert("Something went wrong. Please check your network or server.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Complaint Details - Trust Bite</title>
      </Head>

      <Header />

      <main className={styles.main}>
        <h2>Complaint Details</h2>

        {/* Complaint Information */}
        <div className={styles.complaintInfo}>
          <h3>Restaurant: {complaint.restaurant.name}</h3>
          <p><strong>Issue:</strong> {complaint.message}</p>
          <p><strong>Date Submitted:</strong> {new Date(complaint.createdAt).toLocaleDateString()}</p>
          {complaint.remark && <p><strong>Food Safety Remark:</strong> {complaint.remark}</p>}
        </div>
                {/* Status Update Form (Only for FoodSafetyOfficeUser) */}
        {userRole === "FoodSafetyOfficeUser" && nextStatuses.length > 0 && (
        <div className={styles.statusUpdateForm}>
            <h3>Update Complaint Status</h3>
            <label>Status:</label>
            <select className={styles.statusSelect} value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="">Select Status</option>
              {nextStatuses.map((step) => (
                <option key={step} value={step}>{step}</option>
              ))}
            </select>

            {(newStatus === "Action Taken" || newStatus === "Resolved") && (
              <>
                <label>Remark:</label>
                <textarea 
                  className={styles.textarea} 
                  placeholder={`Describe the actions taken before moving to '${newStatus}'`} 
                  value={remark} 
                  onChange={(e) => setRemark(e.target.value)}
                />
              </>
            )}

            <button className={styles.submitButton} onClick={handleStatusUpdate}>
              Update Status
            </button>
          </div>
        )}

        {/* 🚀 Progress Tracker */}
        <div className={styles.trackerContainer}>
          {statusSteps.map((step, index) => (
            <div key={index} className={styles.step}>
              {index !== 0 && <div className={styles.line}></div>} {/* Line Between Steps */}
              <div className={`${styles.circle} ${index <= currentStep ? styles.active : ""}`}>{index + 1}</div>
              <p className={styles.stepLabel}>{step}</p>
            </div>
          ))}
        </div>

        {/* 🚀 Activity Log */}
          <h3 className={styles.h3}>Activity Log</h3>
        <div className={styles.activityLogContainer}>
          {complaint.activityLog.length === 0 ? (
            <p>No activity recorded yet.</p>
          ) : (
            <ul className={styles.activityLogList}>
              {complaint.activityLog.map((log, index) => (
                <li key={index} className={styles.activityLogItem}>
                  <strong>{log.status}:</strong> {log.remark || "No remark"} <br />
                  <span className={styles.activityUser}>By: {log.user?.email || "Unknown"}</span> <br />
                  <span className={styles.activityTimestamp}>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>



        {/* Back Button */}
        <button className={styles.backButton} onClick={() => router.push("/complaints")}>
          Back to Complaints
        </button>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2024 Trust Bite. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default ComplaintDetail;