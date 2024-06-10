import { Navigate } from 'react-router-dom';

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to='/login' />;
};

export default ProtectedRoute;
