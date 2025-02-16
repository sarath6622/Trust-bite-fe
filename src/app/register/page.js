"use client";

import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import styles from './Auth.module.css';

export default function Register() {
  const [name, setName] = useState(''); // ✅ Name field added
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Customer'); // Default role
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Check if the component is mounted client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !role) {
      setError('Please fill in all fields');
      return;
    }

    try {
      console.log("🔹 Sending registration request...", { name, email, password, role });

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, { 
        name, // ✅ Sending name
        email, 
        password, 
        role 
      });

      console.log("✅ Registration successful", response.data);
      alert('Registration successful');
      setIsRegistered(true);
    } catch (error) {
      console.error("❌ Registration error:", error.response?.data?.message || error.message);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  // Redirect after successful registration
  useEffect(() => {
    if (isClient && isRegistered) {
      router.push('/login'); // Redirect to login page
    }
  }, [isRegistered, isClient, router]);

  // Render nothing until it's client-side
  if (!isClient) return null;

  return (
    <div className={styles.container}>
      <Head>
        <title>Register - ServeRight</title>
      </Head>
      <div className={styles.formContainer}>
        <h2 className={styles.h2}>Register</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Full Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className={styles.input} 
            required 
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className={styles.input} 
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className={styles.input} 
            required
          />
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
            className={styles.input} 
            required
          >
            <option value="Customer">Customer</option>
            <option value="RestaurantOwner">Restaurant Owner</option>
            <option value="Admin">Admin</option>
            <option value="FoodSafetyOfficeUser">Food Safety Office User</option>
          </select>
          <button className={styles.button} type="submit">Register</button>
        </form>
        <p className={styles.linkText}>Already have an account? <Link href="/login">Login</Link></p>
      </div>
    </div>
  );
}