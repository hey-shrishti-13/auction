import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import ClientDashboard from './ClientDashboard';
import VendorDashboard from './VendorDashboard';

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  if (user.role === 'client') {
    return <ClientDashboard />;
  } else if (user.role === 'vendor') {
    return <VendorDashboard />;
  }

  return <div>Admin Dashboard (Coming Soon)</div>;
};

export default Dashboard;