"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Head from "next/head";
import Header from "../../../../components/layout/Header"; 
import styles from "./ComplaintManagement.module.css";
import withAuth from "../../../../components/utils/withAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const statusSteps = ["Submitted", "Acknowledged", "Action Taken", "Resolved"];

function ComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Authentication token missing. Please log in.");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/all-complaints`, { headers });
        setComplaints(response.data.complaints);
      } catch (error) {
        console.error("❌ Error fetching complaints:", error.response?.data || error.message);
        toast.error("Failed to fetch complaints. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/complaint/${complaintId}/status`, 
        { status: newStatus },
        { headers }
      );

      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint._id === complaintId ? { ...complaint, status: newStatus } : complaint
        )
      );

      toast.success("Complaint status updated successfully!");
    } catch (error) {
      console.error("❌ Error updating status:", error.response?.data || error.message);
      toast.error("Failed to update status. Please try again.");
    }
  };

  if (loading) return <p className={styles.loading}>Loading complaints...</p>;

  return (
    <div className={styles.container}>
      <Head>
        <title>Complaint Management - Trust Bite</title>
      </Head>

      <Header />
      <ToastContainer position="top-right" autoClose={3000} />

      <main className={styles.main}>
        <h2>Complaint Management</h2>

        {error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <div className={styles.complaintList}>
            {complaints.map((complaint) => (
              <div 
                key={complaint._id} 
                className={styles.complaintCard} 
                onClick={() => router.push(`/complaints/${complaint._id}`)} // Navigate to complaint detail
              >
                <h3>{complaint.restaurant.name}</h3>
                <p><strong>Issue:</strong> {complaint.message}</p>
                <p><strong>Status:</strong> {complaint.status}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default withAuth(ComplaintManagement);