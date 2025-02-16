"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function withAuth(Component) {
  return function ProtectedRoute(props) {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login"); // Redirect if no token is found
      } else {
        setIsAuthenticated(true);
      }
    }, [router]);

    // Show nothing while authentication check is in progress
    if (isAuthenticated === null) {
      return null;
    }

    return <Component {...props} />;
  };
}