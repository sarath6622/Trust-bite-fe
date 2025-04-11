"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import axios from "axios";
import Header from "../../../../components/layout/Header"; // Adjust path as needed
import styles from "./RegisterRestaurant.module.css"; // Adjust path as needed
import withAuth from "../../../../components/utils/withAuth"; // Adjust path as needed

function RegisterRestaurant() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact: "",
    cuisineType: "",
    description: "",
    photos: []
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      const user = JSON.parse(atob(token.split(".")[1]));
      if (!["Admin", "RestaurantOwner"].includes(user.role)) {
        router.push("/");
      }
    }
  }, [router]);

  const handleChange = (e) => {
    if (e.target.name === 'photos') {
      setSelectedFiles(e.target.files);
      setFormData({ ...formData, photos: Array.from(e.target.files) });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      formDataToSend.append('name', formData.name);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('contact', formData.contact);
      formDataToSend.append('cuisineType', formData.cuisineType);
      formDataToSend.append('description', formData.description);

      for (let i = 0; i < selectedFiles.length; i++) {
        formDataToSend.append('photos', selectedFiles[i]);
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/register`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );

      setSuccessMessage("Restaurant registered successfully!");
      setFormData({ name: "", address: "", contact: "", cuisineType: "", description: "", photos: [] });
      setSelectedFiles([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register restaurant.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Register Restaurant</title>
      </Head>
      <Header />
      <main className={styles.main}>
        <h2>Register Your Restaurant</h2>
        {error && <p className={styles.error}>{error}</p>}
        {successMessage && <p className={styles.success}>{successMessage}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Restaurant Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="contact">Contact</label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cuisineType">Cuisine Type</label>
            <input
              type="text"
              id="cuisineType"
              name="cuisineType"
              value={formData.cuisineType}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="photos">Photos (up to 5)</label>
            <input
              type="file"
              id="photos"
              name="photos"
              multiple
              onChange={handleChange}
              accept="image/*"
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </main>
      <footer className={styles.footer}>
        <p>&copy; 2024 Your Company. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default withAuth(RegisterRestaurant);