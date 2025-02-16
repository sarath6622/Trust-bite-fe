"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import withAuth from "../../../../components/utils/withAuth";
import styles from "../Dashboard.module.css";
import Header from "../../../../components/layout/Header";
import { FaStar, FaStarHalfAlt, FaRegStar, FaUserCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";

function RestaurantOwnerDashboard() {
  const [restaurant, setRestaurant] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComplaints, setShowComplaints] = useState(true); // 🔽 Default to open
  const [showReviews, setShowReviews] = useState(true); // 🔽 Default to open
  const router = useRouter();

  // ⭐ Format date
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔹 Fetching restaurant owner data...");
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("❌ No token found.");
          return;
        }
    
        const headers = { Authorization: `Bearer ${token}` };
    
        // Fetch restaurant data
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/owner`,
          { headers }
        );
        setRestaurant(res.data.restaurant);
    
        if (res.data.restaurant) {
          const restaurantId = res.data.restaurant._id;
    
          // Fetch complaints
          const complaintsRes = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/${restaurantId}/complaints`,
            { headers }
          );
          setComplaints(complaintsRes.data.complaints || []);
    
          // Fetch reviews
          const reviewsRes = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/${restaurantId}/reviews`,
            { headers }
          );
          setReviews(reviewsRes.data.reviews || []);
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error.response ? error.response.data : error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const manageRestaurant = () => {
    router.push(`/restaurants/manage`);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Header />
      <div className={styles.container}>

        {!restaurant ? (
          <div className={styles.noRestaurant}>
            <p>You don't have a restaurant registered yet.</p>
            <button onClick={() => router.push("/restaurants/register")} className={styles.registerButton}>
              Register Your Restaurant
            </button>
          </div>
        ) : (
          <>
            {/* 🔹 Review & Complaint Count Cards */}
            <div className={styles.statsContainer}>
              <div className={styles.statsCard}>
                <h4>Total Reviews</h4>
                <p className={styles.statsNumber}>{reviews.length}</p>
              </div>
              <div className={styles.statsCard}>
                <h4>Total Complaints</h4>
                <p className={styles.statsNumber}>{complaints.length}</p>
              </div>
            </div>

            {/* 🔹 Complaints Section (Collapsible) */}
            <div className={styles.section}>
              <div className={styles.sectionHeader} onClick={() => setShowComplaints(!showComplaints)}>
                <h3>Complaints ({complaints.length})</h3>
                {showComplaints ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {showComplaints && (
                complaints.length === 0 ? (
                  <p>No complaints yet.</p>
                ) : (
                  complaints.map((complaint) => (
                    <div key={complaint._id} className={styles.card}>
                      <p><strong>Message:</strong> {complaint.message || "No message available"}</p>
                      <p><strong>Status:</strong> {complaint.status || "Unknown"}</p>
                      <p><strong>User:</strong> {complaint.user?.email || "Anonymous"}</p>
                      <p><strong>Date:</strong> {new Date(complaint.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))
                )
              )}
            </div>

            {/* 🔹 Reviews Section (Collapsible) */}
            <div className={styles.section}>
              <div className={styles.sectionHeader} onClick={() => setShowReviews(!showReviews)}>
                <h3>Reviews ({reviews.length})</h3>
                {showReviews ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {showReviews && (
                reviews.length === 0 ? (
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
                )
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default withAuth(RestaurantOwnerDashboard);