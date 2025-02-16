"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import withAuth from "../../../../components/utils/withAuth";
import styles from "../Dashboard.module.css";
import Header from "../../../../components/layout/Header";
import { FaUser, FaBuilding, FaShieldAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";

function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRestaurants, setTotalRestaurants] = useState(0);
  const [totalSafetyOfficers, setTotalSafetyOfficers] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        console.log("🔹 Fetching admin dashboard data...");
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("❌ No token found.");
          return;
        }
        
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch total users
        const usersRes = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/users/count`,
          { headers }
        );
        setTotalUsers(usersRes.data.count);

        // Fetch total restaurants
        const restaurantsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/restaurants/count`,
          { headers }
        );
        setTotalRestaurants(restaurantsRes.data.count);

        // Fetch total food safety officers
        const safetyRes = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/safety-officers/count`,
          { headers }
        );
        setTotalSafetyOfficers(safetyRes.data.count);

        // Fetch total food safety officers
        const customerRes = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/customer/count`,
            { headers }
        );
        setTotalCustomers(customerRes.data.count);

      } catch (error) {
        console.error("❌ Error fetching admin data:", error.response ? error.response.data : error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Header />
      <div className={styles.container}>
        <h2>Admin Dashboard</h2>

        <div className={styles.statsContainer}>
          <div className={styles.statsCard}>
            <FaUser className={styles.icon} />
            <h4>Total Users</h4>
            <p className={styles.statsNumber}>{totalUsers}</p>
          </div>
          <div className={styles.statsCard}>
            <FaBuilding className={styles.icon} />
            <h4>Total Restaurants</h4>
            <p className={styles.statsNumber}>{totalRestaurants}</p>
          </div>
          <div className={styles.statsCard}>
            <FaShieldAlt className={styles.icon} />
            <h4>Total Safety Officers</h4>
            <p className={styles.statsNumber}>{totalSafetyOfficers}</p>
          </div>
          <div className={styles.statsCard}>
            <FaShieldAlt className={styles.icon} />
            <h4>Customers</h4>
            <p className={styles.statsNumber}>{totalCustomers}</p>
          </div>
          
        </div>
      </div>
    </>
  );
}

export default withAuth(AdminDashboard);
