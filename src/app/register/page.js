"use client";

import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import styles from './Auth.module.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Customer');
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

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
        name,
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

  useEffect(() => {
    if (isClient && isRegistered) {
      router.push('/login');
    }
  }, [isRegistered, isClient, router]);

  if (!isClient) return null;

  return (
    <div className="flex h-screen w-full bg-gradient-to-r from-black-500 to-blue-600">
      <Head>
        <title>Register - ServeRight</title>
      </Head>

      {/* Left Side - Jumbotron */}
      

      {/* Right Side - Registration Form */}
      <div className="flex justify-center items-center w-full md:w-1/2 p-6 m-auto">
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 text-white px-10">
        <h1 className="text-4xl font-bold mb-4">Welcome to Trust Bite!</h1>
        <p className="text-lg">Your trusted platform for honest restaurant reviews.</p>
      </div>
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
    </div>
  );
}