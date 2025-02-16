"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Head from "next/head";
import Header from "../../../../components/layout/Header";
import styles from "./RestaurantDetail.module.css";
import withAuth from "../../../../components/utils/withAuth";
import { FaStar, FaStarHalfAlt, FaRegStar, FaUserCircle } from "react-icons/fa";


function RestaurantDetail() {
  const { id } = useParams(); // Get the restaurant ID from the URL
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Review & Complaint States
  const [showReviewBox, setShowReviewBox] = useState(false);
  const [showComplaintBox, setShowComplaintBox] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [rating, setRating] = useState(5); // Default rating

    // ⭐ Format date to "10th Feb, 2025"
    const formatDate = (dateString) => {
      const options = { day: "numeric", month: "short", year: "numeric" };
      return new Date(dateString).toLocaleDateString("en-GB", options).replace(",", "");
    };

    // ⭐ Dynamic star rendering
    const renderStars = (rating) => {
      const fullStars = Math.floor(rating);
      const halfStar = rating % 1 >= 0.5;
      const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
      return (
        <span className={styles.stars}>
          {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} className={styles.fullStar} />)}
          {halfStar && <FaStarHalfAlt className={styles.halfStar} />}
          {[...Array(emptyStars)].map((_, i) => <FaRegStar key={`empty-${i}`} className={styles.emptyStar} />)}
        </span>
      );
    };

    const [complaints, setComplaints] = useState([]); // State for complaints

    useEffect(() => {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("❌ No token found.");
            return;
          }
    
          const headers = { Authorization: `Bearer ${token}` };
    
          if (id) {
            console.log("📡 Fetching restaurant details by ID...");
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/id/${id}`, { headers });
            setRestaurant(res.data);
          }
    
          // Fetch reviews
          const reviewsRes = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/${id}/reviews`,
            { headers }
          );
          setReviews(reviewsRes.data.reviews);
    
          // ✅ Fetch complaints
          const complaintsRes = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/${id}/complaints`,
            { headers }
          );
          setComplaints(complaintsRes.data.complaints);
          
        } catch (error) {
          console.error("❌ Error fetching data:", error.response ? error.response.data : error);
          setError("Error fetching restaurant data");
        } finally {
          setLoading(false);
        }
      };
    
      fetchData();
    }, [id]);

  // Submit Review Function
  const handleReviewSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/${id}/review`,
        { rating, comment: reviewText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Review submitted successfully!");
      setReviewText(""); 
      setShowReviewBox(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review.");
    }
  };

  // Submit Complaint Function
  const handleComplaintSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required.");
        return;
      }
  
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/${id}/complaint`, // ✅ Correct URL
        { message: complaintText },
        { headers }
      );
  
      alert("Complaint submitted successfully!");
      setComplaintText("");
      setShowComplaintBox(false);
    } catch (error) {
      console.error("❌ Error submitting complaint:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to submit complaint.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!restaurant) return <p>Restaurant not found</p>;

  return (
    <div className={styles.container}>
      <Head>
        <title>{restaurant.name} - Trust Bite</title>
        <meta name="description" content={`Details about ${restaurant.name}`} />
      </Head>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className={styles.main}>
        <h1 className={styles.h2}>{restaurant.name}</h1>
        <div className={styles.detailsContainer}>
          <img
            src={restaurant.image || "/restaurant-placeholder.jpg"}
            alt={restaurant.name}
            className={styles.restaurantImage}
          />
          <div className={styles.restaurantInfo}>
            <p><strong>📍 Address:</strong> {restaurant.address}</p>
            <p><strong>📞 Contact:</strong> {restaurant.contact}</p>
            <p><strong>🍽️ Cuisine:</strong> {restaurant.cuisineType}</p>
            <p><strong>⭐ Rating:</strong> {restaurant.rating} Stars</p>
            <p className={styles.description}>{restaurant.description}</p>
          </div>
        </div>

        {/* Buttons for Review & Complaint */}
        <div className={styles.buttonContainer}>
          <button className={styles.reviewButton} onClick={() => setShowReviewBox(!showReviewBox)}>
            {showReviewBox ? "Cancel Review" : "Add a Review"}
          </button>
          <button className={styles.complaintButton} onClick={() => setShowComplaintBox(!showComplaintBox)}>
            {showComplaintBox ? "Cancel Complaint" : "Post a Complaint"}
          </button>
        </div>

        {/* Review Box */}
        {showReviewBox && (
          <div className={styles.reviewBox}>
            <h3>Leave a Review</h3>
            <select className={styles.ratingSelect} value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
              <option value="4">⭐⭐⭐⭐ - Very Good</option>
              <option value="3">⭐⭐⭐ - Average</option>
              <option value="2">⭐⭐ - Poor</option>
              <option value="1">⭐ - Terrible</option>
            </select>
            <textarea
              className={styles.textarea}
              placeholder="Write your review here..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <button className={styles.submitButton} onClick={handleReviewSubmit}>
              Submit Review
            </button>
          </div>
        )}

        {/* Complaint Form */}
        {showComplaintBox && (
          <div className={styles.complaintBox}>
            <h3 >Post a Complaint</h3>
            <textarea
              className={styles.textarea}
              placeholder="Describe your issue..."
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
            />
            <button className={styles.submitButton} onClick={handleComplaintSubmit}>
              Submit Complaint
            </button>
          </div>
        )}

        {/* Complaints Section */}
        <div className={styles.section}>
          <h3>Complaints</h3>
          {complaints.length === 0 ? (
            <p>No complaints yet.</p>
          ) : (
            complaints.map((complaint) => (
              <div key={complaint._id} className={styles.card}>
                <p className={styles.comment}><strong>Issue:</strong> {complaint.message}</p>
                <p className={styles.status}>
                  <strong>Status:</strong> 
                  <span className={styles[complaint.status.toLowerCase()]}> {complaint.status}</span>
                </p>
                <div className={styles.reviewHeader}>
                  <FaUserCircle className={styles.avatar} />
                  <div className={styles.reviewInfo}>
                    <p className={styles.email}><strong>{complaint.user?.email || "Anonymous"}</strong></p>
                    <p className={styles.date}>{formatDate(complaint.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reviews Section */}
        <div className={styles.section}>
          <h3>Reviews</h3>
          {reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className={styles.card}>
                <div className={styles.stars}>{renderStars(review.rating)}</div>
                <p className={styles.comment}>{review.comment}</p>
                <div className={styles.reviewHeader}>
                  <FaUserCircle className={styles.avatar} />
                  <div className={styles.reviewInfo}>
                    <p className={styles.email}><strong>{review.user?.email || "Unknown"}</strong></p>
                    <p className={styles.date}>{formatDate(review.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2024 Trust Bite. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default withAuth(RestaurantDetail);