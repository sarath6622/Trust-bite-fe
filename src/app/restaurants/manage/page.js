"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Header from "../../../../components/layout/Header";
import withAuth from "../../../../components/utils/withAuth";
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
    photos: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [photosToRemove, setPhotosToRemove] = useState([]);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/owner`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.restaurant) {
          setRestaurant(response.data.restaurant);
          setFormData({ ...response.data.restaurant, photos: response.data.restaurant.photos.map(p => ({ url: p.url, filename: p.filename })) });
        } else {
          setError("You haven't registered a restaurant yet.");
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch restaurant details. Please try again later.");
        setLoading(false);
        console.error("Error fetching restaurant:", err);
      }
    };
    fetchRestaurant();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === 'photos') {
      const files = Array.from(e.target.files);
      //Basic file validation
      if (files.some(file => file.size > 5 * 1024 * 1024)) { //5MB limit
        setError("File size too large (max 5MB).");
        return;
      }
      if (files.some(file => !file.type.startsWith('image/'))) {
        setError("Invalid file type. Please upload images only.");
        return;
      }
      setSelectedFiles(files);
      setFormData({ ...formData, photos: [...formData.photos, ...files] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleRemovePhoto = (filename) => {
    setPhotosToRemove([...photosToRemove, filename]);
    setFormData({ ...formData, photos: formData.photos.filter(photo => photo.filename !== filename) });
  };

  const handleUpdate = async (e) => {
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
      formDataToSend.append('photosToRemove', JSON.stringify(photosToRemove));

      for (const file of selectedFiles) {
        formDataToSend.append('photos', file);
      }
      for (const photo of formData.photos) {
        if (photo.filename) {
          formDataToSend.append('photos', photo.filename);
        }
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/manage/${restaurant._id}`,
        formDataToSend,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );

      setSuccessMessage("Restaurant updated successfully!");
      setRestaurant(formData);
      setIsEditing(false);
      setSelectedFiles([]);
      setPhotosToRemove([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update restaurant.");
      console.error("Error updating restaurant:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(restaurant);
    setIsEditing(false);
    setSelectedFiles([]);
    setPhotosToRemove([]);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this restaurant? This action cannot be undone.");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/manage/${restaurant._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Restaurant deleted successfully!");
      router.push("/restaurants");
    } catch (err) {
      setError("Failed to delete restaurant. Please try again later.");
      console.error("Error deleting restaurant:", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <Head>
          <title>Manage Restaurant</title>
        </Head>
        <h2 className={styles.title}>Manage Your Restaurant</h2>
        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {restaurant && (
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
              <textarea name="description" value={formData.description} onChange={handleChange} disabled={!isEditing} />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="photos">Photos</label>
              <input type="file" id="photos" name="photos" multiple onChange={handleChange} accept="image/*" />
              <div>
                {formData.photos.map((photo, index) => (
                  <div key={index} className={styles.photoContainer}>
                    <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${photo.url}`} alt={`Restaurant Photo ${index + 1}`} className={styles.photo} />
                    <button onClick={() => handleRemovePhoto(photo.filename)} className={styles.removePhotoButton}>Remove</button>
                  </div>
                ))}
              </div>
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
        )}
      </div>
    </div>
  );
}

export default withAuth(ManageRestaurant);