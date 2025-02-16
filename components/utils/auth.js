import jwtDecode from 'jwt-decode';

export const getUserRole = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      const user = jwtDecode(token);
      return user.role;
    }
  }
  return null;
};