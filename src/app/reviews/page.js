"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Header from "../../../components/layout/Header"; // Reusable Header
// import Footer from "../../../components/layout/Footer"; // Reusable Header
import styles from "./Reviews.module.css";
import withAuth from "../../../components/utils/withAuth";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user's submitted reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("❌ No token found.");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants/my-reviews`, { headers });
        setReviews(response.data.reviews);
      } catch (error) {
        console.error("❌ Error fetching reviews:", error.response ? error.response.data : error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

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

  if (loading) return <p className={styles.loading}>Loading your reviews...</p>;

  return (
    <div className={styles.container}>
      <Head>
        <title>My Reviews - Trust Bite</title>
        <meta name="description" content="View all reviews submitted by you" />
      </Head>

      <Header />

      <main className={styles.main}>
        <h2 className={styles.h2}>My Reviews</h2>

        {reviews.length === 0 ? (
          <p className={styles.noReviews}>You haven't submitted any reviews yet.</p>
        ) : (
          <div className={styles.reviewList}>
            {reviews.map((review) => (
              <div
                key={review._id}
                className={styles.reviewCard}
                onClick={() => router.push(`/restaurants/${review.restaurant._id}`)}
              >
                <h3>{review.restaurant.name}</h3>
                <div className={styles.stars}>{renderStars(review.rating)}</div>
                <p className={styles.comment}>{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* <Footer /> */}
    </div>
  );
}

export default withAuth(MyReviews);