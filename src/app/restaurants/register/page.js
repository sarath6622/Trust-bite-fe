"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import Header from "../../../../components/layout/Header";
import styles from "./RegisterRestaurant.module.css";
import withAuth from "../../../../components/utils/withAuth"; // Import HOC for authentication

function RegisterRestaurant() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact: "",
    cuisineType: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if the user is authorized
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      const user = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
      if (!["Admin", "RestaurantOwner"].includes(user.role)) {
        router.push("/"); // Redirect unauthorized users
      }
    }
  }, [router]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/register`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccessMessage("Restaurant registered successfully!");
      setFormData({ name: "", address: "", contact: "", cuisineType: "", description: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register restaurant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Register Restaurant - Trust Bite</title>
        <meta name="description" content="Register your restaurant on Trust Bite" />
      </Head>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className={styles.main}>
        <h2>Register Your Restaurant</h2>
        {error && <p className={styles.error}>{error}</p>}
        {successMessage && <p className={styles.success}>{successMessage}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Restaurant Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address">Address</label>
            <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="contact">Contact</label>
            <input type="text" id="contact" name="contact" value={formData.contact} onChange={handleChange} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cuisineType">Cuisine Type</label>
            <input type="text" id="cuisineType" name="cuisineType" value={formData.cuisineType} onChange={handleChange} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2024 Trust Bite. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default withAuth(RegisterRestaurant);