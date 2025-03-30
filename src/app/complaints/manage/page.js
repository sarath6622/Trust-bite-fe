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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const statusSteps = ["All", "Submitted", "Acknowledged", "Action Taken", "Resolved"];
const dateFilters = ["Today", "Yesterday", "Last 7 Days", "This Month", "Custom"];

function ComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("Today");
  const [dateRange, setDateRange] = useState([null, null]);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const [startDate, endDate] = dateRange;

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

        const sortedComplaints = response.data.complaints.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setComplaints(sortedComplaints);
        setFilteredComplaints(sortedComplaints);
      } catch (error) {
        console.error("❌ Error fetching complaints:", error.response?.data || error.message);
        toast.error("Failed to fetch complaints. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // ⭐ Date Filter Logic
  const filterByDate = (complaints, filter) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return complaints.filter((complaint) => {
      const complaintDate = new Date(complaint.createdAt);

      switch (filter) {
        case "Today":
          return complaintDate.toDateString() === today.toDateString();
        case "Yesterday":
          return complaintDate.toDateString() === yesterday.toDateString();
        case "Last 7 Days":
          return complaintDate >= sevenDaysAgo;
        case "This Month":
          return complaintDate >= startOfMonth;
        case "Custom":
          if (startDate && endDate) {
            return complaintDate >= startDate && complaintDate <= endDate;
          }
          return true;
        default:
          return true;
      }
    });
  };

  // 🔥 Apply Filters
  useEffect(() => {
    let filtered = complaints;

    if (statusFilter !== "All") {
      filtered = filtered.filter((complaint) => complaint.status === statusFilter);
    }

    filtered = filterByDate(filtered, dateFilter);
    setFilteredComplaints(filtered);
  }, [statusFilter, dateFilter, dateRange, complaints]);

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/complaint/${complaintId}/status`,
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

        {/* 🔹 Filter Section */}
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Status:</label>
            <select value={statusFilter} className={styles.selectDropdown} onChange={(e) => setStatusFilter(e.target.value)}>
              {statusSteps.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Date:</label>
            <select
              value={dateFilter}
              className={styles.selectDropdown}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setShowCustomPicker(e.target.value === "Custom");
              }}
            >
              {dateFilters.map((filter) => (
                <option key={filter} value={filter}>
                  {filter}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Range Picker */}
          {showCustomPicker && (
            <div className={styles.filterGroup}>
              <label>Custom Range:</label>
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                className={styles.selectDropdown}
                onChange={(update) => setDateRange(update)}
                isClearable={true}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select date range"
              />
            </div>
          )}
        </div>

        {/* 🔹 Complaints List */}
        {error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <div className={styles.complaintList}>
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className={styles.complaintCard}
                  onClick={() => router.push(`/complaints/${complaint._id}`)}
                >
                  <h3>{complaint.restaurant.name}</h3>
                  <p><strong>Issue:</strong> {complaint.message}</p>
                  <p><strong>User:</strong> {complaint.user}</p>
                  <p><strong>Created on:</strong> {new Date(complaint.createdAt).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> {complaint.status}</p>
                </div>
              ))
            ) : (
              <p>No complaints found matching the filters.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default withAuth(ComplaintManagement);