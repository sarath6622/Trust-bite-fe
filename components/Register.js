import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Customer',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', formData);
      alert('Registration successful');
    } catch (error) {
      alert('Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <select name="role" onChange={handleChange}>
        <option value="Customer">Customer</option>
        <option value="Admin">Admin</option>
        <option value="RestaurantOwner">Restaurant Owner</option>
        <option value="FoodSafetyOfficeUser">Food Safety Office User</option>
      </select>
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;