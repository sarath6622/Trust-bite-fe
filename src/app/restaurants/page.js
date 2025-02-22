"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Header from "../../../components/layout/Header";
// import Footer from "../../../components/layout/Footer";

import axios from "axios";
import withAuth from "../../../components/utils/withAuth"; // Import HOC for authentication
import styles from "./Restaurants.module.css";

function Restaurants() {
  const pathname = usePathname();
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState(0);
  const [filterCuisine, setFilterCuisine] = useState("");
  const [filterPrice, setFilterPrice] = useState("");
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [filterLocation, setFilterLocation] = useState("");
  const [filterVeg, setFilterVeg] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const restaurantsPerPage = 6;
  const [error, setError] = useState("");

  // Fetch Restaurants from Backend API
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurants`
        );
        setRestaurants(response.data);
      } catch (err) {
        setError("Failed to load restaurants");
      }
    };

    fetchRestaurants();
  }, []);

  // Filter restaurants based on search and filters
  const filteredRestaurants = restaurants
    .filter((restaurant) =>
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((restaurant) =>
      filterRating ? restaurant.avgRating >= filterRating : true
    )
    .filter((restaurant) =>
      filterCuisine ? restaurant.cuisineType === filterCuisine : true
    )
    .filter((restaurant) =>
      filterPrice ? restaurant.priceRange === filterPrice : true
    )
    .filter((restaurant) =>
      filterOpenNow ? restaurant.isOpenNow : true
    )
    .filter((restaurant) =>
      filterLocation ? restaurant.address.includes(filterLocation) : true
    )
    .filter((restaurant) =>
      filterVeg ? restaurant.vegFriendly : true
    );

  // Pagination Logic
  const indexOfLastRestaurant = currentPage * restaurantsPerPage;
  const indexOfFirstRestaurant = indexOfLastRestaurant - restaurantsPerPage;
  const currentRestaurants = filteredRestaurants.slice(
    indexOfFirstRestaurant,
    indexOfLastRestaurant
  );

  const totalPages = Math.ceil(filteredRestaurants.length / restaurantsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilterRating(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleCuisineChange = (e) => {
    setFilterCuisine(e.target.value);
    setCurrentPage(1);
  };

  const handlePriceChange = (e) => {
    setFilterPrice(e.target.value);
    setCurrentPage(1);
  };

  const handleOpenNowChange = (e) => {
    setFilterOpenNow(e.target.checked);
    setCurrentPage(1);
  };

  const handleLocationChange = (e) => {
    setFilterLocation(e.target.value);
    setCurrentPage(1);
  };

  const handleVegChange = (e) => {
    setFilterVeg(e.target.checked);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className={styles.container}>
      <Head>
        <title>Trust Bite - Restaurants</title>
        <meta name="description" content="Browse and filter restaurants" />
      </Head>

      <Header />

      <main className={styles.main}>

        {/* Search and Filter Section */}
        <div className={styles.searchFilter}>
          <input
            type="text"
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchBar}
          />
          <select onChange={handleFilterChange} className={styles.filter}>
            <option value="0">All Ratings</option>
            <option value="1">1 Star & Up</option>
            <option value="2">2 Stars & Up</option>
            <option value="3">3 Stars & Up</option>
            <option value="4">4 Stars & Up</option>
            <option value="5">5 Stars Only</option>
          </select>
          <select onChange={handleCuisineChange} className={styles.filter}>
            <option value="">All Cuisines</option>
            <option value="Indian">Indian</option>
            <option value="Italian">Italian</option>
            <option value="Chinese">Chinese</option>
          </select>
          <select onChange={handlePriceChange} className={styles.filter}>
            <option value="">All Prices</option>
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
          </select>
          <label>
            <input type="checkbox" onChange={handleOpenNowChange} /> Open Now
          </label>
          <input
            type="text"
            placeholder="Enter location"
            value={filterLocation}
            onChange={handleLocationChange}
            className={styles.searchBar}
          />
          <label>
            <input type="checkbox" onChange={handleVegChange} /> Vegetarian
          </label>
        </div>

        {/* Restaurant Cards */}
        <div className={styles.cardContainer}>
          {currentRestaurants.map((restaurant) => (
            <div key={restaurant._id} className={styles.card}>
              <Image
                src="/restaurant-placeholder.jpg"
                alt={restaurant.name}
                width={300}
                height={200}
                className={styles.restaurantImage}
              />
              <h3>{restaurant.name}</h3>
              <p>📍 {restaurant.address}</p>
              <p>📞 {restaurant.contact}</p>
              <p>🍽️ {restaurant.cuisineType}</p>
              <p>⭐ {restaurant.avgRating} Stars</p>
              <Link href={`/restaurants/${restaurant._id}`}>
                <button className={styles.detailButton}>View Details</button>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default withAuth(Restaurants);
