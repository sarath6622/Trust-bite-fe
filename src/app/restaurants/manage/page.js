"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Header from "../../../../components/layout/Header";
import withAuth from "../../../../components/utils/withAuth"; // Restrict access to only RestaurantOwners
import styles from "./ManageRestaurant.module.css";

function ManageRestaurant() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact: "",
    cuisineType: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // 🔹 Fetch restaurant details when page loads
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/owner`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.restaurant) {
          setRestaurant(response.data.restaurant);
          setFormData(response.data.restaurant);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch restaurant details.");
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, []);

  // 🔹 Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Handle Restaurant Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/manage/${restaurant._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage("Restaurant updated successfully!");
      setRestaurant(formData);
      setIsEditing(false); // Disable edit mode
    } catch (err) {
      setError("Failed to update restaurant.");
    }
  };

  // 🔹 Handle Cancel (Reset to Original Data)
  const handleCancel = () => {
    setFormData(restaurant); // Reset to original data
    setIsEditing(false); // Disable edit mode
  };

  // 🔹 Handle Restaurant Deletion
  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this restaurant?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/manage/${restaurant._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Restaurant deleted successfully!");
      router.push("/restaurants"); // Redirect after deletion
    } catch (err) {
      setError("Failed to delete restaurant.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!restaurant) return <p>You haven't registered a restaurant yet.</p>;

  return (
    <div>
      <Header />

        <div className={styles.container}>
      <Head>
        <title>Manage Restaurant</title>
      </Head>


      <h2 className={styles.title}>Manage Your Restaurant</h2>

      {error && <p className={styles.error}>{error}</p>}
      {successMessage && <p className={styles.success}>{successMessage}</p>}

      <form onSubmit={handleUpdate} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} required />
        </div>

        <div className={styles.formGroup}>
          <label>Address</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} disabled={!isEditing} required />
        </div>

        <div className={styles.formGroup}>
          <label>Contact</label>
          <input type="text" name="contact" value={formData.contact} onChange={handleChange} disabled={!isEditing} required />
        </div>

        <div className={styles.formGroup}>
          <label>Cuisine Type</label>
          <input type="text" name="cuisineType" value={formData.cuisineType} onChange={handleChange} disabled={!isEditing} required />
        </div>

        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} disabled={!isEditing}></textarea>
        </div>

        {isEditing ? (
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.updateButton}>Save</button>
            <button type="button" className={styles.cancelButton} onClick={handleCancel}>Cancel</button>
          </div>
        ) : (
          <button type="button" className={styles.editButton} onClick={() => setIsEditing(true)}>Edit</button>
        )}

        <button type="button" className={styles.deleteButton} onClick={handleDelete}>Delete</button>
      </form>
    </div>
    </div>
    
  );
}

export default withAuth(ManageRestaurant);