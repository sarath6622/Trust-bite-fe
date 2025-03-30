"use client";

import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import styles from "./Auth.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter all fields");
      return;
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, { email, password });
      localStorage.setItem("token", response.data.token);
      setIsLoggedIn(true);
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  useEffect(() => {
    if (isClient && isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, isClient, router]);

  if (!isClient) return null;

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const fillCredentials = (role) => {
    const credentials = {
      customer: { email: "customer@gmail.com", password: "Password123!" },
      admin: { email: "admin@gmail.com", password: "Password123!" },
      owner: { email: "ameera@gmail.com", password: "Password123!" },
      foodsafety: { email: "foodsafety@gmail.com", password: "Password123!" },
    };

    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-r from-black-500 to-blue-600">
      <Head>
        <title>Login - ServeRight</title>
      </Head>

      <div className="flex justify-center items-center w-full md:w-1/2 p-6 m-auto">
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 text-white px-10">
          <h1 className="text-4xl font-bold mb-4">Welcome to Trust Bites!</h1>
          <p className="text-lg">Your trusted platform for honest restaurant reviews.</p>
        </div>

        <div className={styles.formContainer}>
          <h2 className={styles.h2}>Login</h2>
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.quickLoginContainer}>
            <button className={styles.quickLoginButton} onClick={() => fillCredentials("customer")}>
              Customer
            </button>
            <button className={styles.quickLoginButton} onClick={() => fillCredentials("admin")}>
              Admin
            </button>
            <button className={styles.quickLoginButton} onClick={() => fillCredentials("owner")}>
              Owner
            </button>
            <button className={styles.quickLoginButton} onClick={() => fillCredentials("foodsafety")}>
              Food Safety
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.inputContainer}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.inputContainer}>
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
              />
              <span className={styles.eyeIcon} onClick={togglePasswordVisibility}>
                {passwordVisible ? <EyeOff size={20} color="white" /> : <Eye size={20} color="white" />}
              </span>
            </div>

            <button className={styles.button} type="submit">
              Login
            </button>
          </form>

          <p className={styles.linkText}>
            Don't have an account? <Link href="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}