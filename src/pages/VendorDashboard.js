import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useAuth } from '../contexts/AuthContext';
import { auctionAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { SignOut, Trophy, Clock, List } from '@phosphor-icons/react';

const VendorDashboard = () => {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [activeAuctions, setActiveAuctions] = useState([]);

  useEffect(() => {
    fetchAuctions();
    fetchActiveAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const { data } = await auctionAPI.getAll();
      setAuctions(data);
    } catch (error) {
      toast.error('Failed to load auctions');
    }
  };

  const fetchActiveAuctions = async () => {
    try {
      const { data } = await auctionAPI.getActive();
      setActiveAuctions(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleRegister = async (auctionId) => {
    try {
      await auctionAPI.register(auctionId);
      toast.success('Registered for auction successfully');
      fetchAuctions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
    }
  };

  return (
    <div className="min-h-screen vendor-bg vendor-theme p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="glassmorphic-pill px-6 py-3">
            <p className="text-sm text-white/70">Logged in as</p>
            <p className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{user?.name}</p>
          </div>
          <Button onClick={handleLogout} variant="ghost" data-testid="logout-button">
            <SignOut size={24} />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glassmorphic p-6" data-testid="available-auctions-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 mb-1">Available Auctions</p>
                <p className="text-4xl font-bold" style={{ color: 'var(--primary)' }}>{auctions.length}</p>
              </div>
              <List size={48} style={{ color: 'var(--primary)' }} />
            </div>
          </Card>
          <Card className="glassmorphic p-6" data-testid="active-auctions-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 mb-1">Active Auctions</p>
                <p className="text-4xl font-bold" style={{ color: 'var(--primary)' }}>{activeAuctions.length}</p>
              </div>
              <Clock size={48} style={{ color: 'var(--primary)' }} />
            </div>
          </Card>
          <Card className="glassmorphic p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 mb-1">Your Role</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>Vendor</p>
              </div>
              <Trophy size={48} style={{ color: 'var(--primary)' }} />
            </div>
          </Card>
        </div>

        {/* Active Auctions */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Active Auctions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeAuctions.map((auction) => (
              <Card key={auction.id} className="glassmorphic p-6" data-testid={`active-auction-card-${auction.id}`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{auction.name}</h3>
                  <span className="glassmorphic-pill px-3 py-1 text-sm font-bold" style={{ color: 'var(--primary)' }}>LIVE</span>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-white/70">Type: <span className="text-white font-semibold">{auction.type}</span></p>
                  <p className="text-white/70">Starting Price: <span className="mono text-white font-bold">${auction.starting_price}</span></p>
                </div>
                <Button
                  onClick={() => navigate(`/auction/${auction.id}`)}
                  className="w-full"
                  style={{ background: 'var(--primary)' }}
                  data-testid={`join-auction-button-${auction.id}`}
                >
                  Join Auction
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Available Auctions */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Available Auctions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.filter(a => a.status !== 'active').map((auction) => (
              <Card key={auction.id} className="glassmorphic p-6" data-testid={`auction-card-${auction.id}`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{auction.name}</h3>
                  <span className="glassmorphic-pill px-3 py-1 text-sm">{auction.status}</span>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-white/70">Type: <span className="text-white font-semibold">{auction.type}</span></p>
                  <p className="text-white/70">Starting Price: <span className="mono text-white font-bold">${auction.starting_price}</span></p>
                </div>
                <Button
                  onClick={() => handleRegister(auction.id)}
                  className="w-full"
                  variant="outline"
                  data-testid={`register-auction-button-${auction.id}`}
                >
                  Register
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;