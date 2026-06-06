import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useAuth } from '../contexts/AuthContext';
import { auctionAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { Plus, SignOut, Clock, List } from '@phosphor-icons/react';
import CreateAuctionModal from '../components/auction/CreateAuctionModal';

const ClientDashboard = () => {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const { data } = await auctionAPI.getAll();
      setAuctions(data);
    } catch (error) {
      toast.error('Failed to load auctions');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen client-bg client-theme p-6">
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
          <Card className="glassmorphic p-6" data-testid="total-auctions-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 mb-1">Total Auctions</p>
                <p className="text-4xl font-bold" style={{ color: 'var(--primary)' }}>{auctions.length}</p>
              </div>
              <List size={48} style={{ color: 'var(--primary)' }} />
            </div>
          </Card>
          <Card className="glassmorphic p-6" data-testid="active-auctions-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 mb-1">Active Auctions</p>
                <p className="text-4xl font-bold" style={{ color: 'var(--primary)' }}>
                  {auctions.filter(a => a.status === 'active').length}
                </p>
              </div>
              <Clock size={48} style={{ color: 'var(--primary)' }} />
            </div>
          </Card>
          <Card className="glassmorphic p-6">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="w-full h-full"
              style={{ background: 'var(--primary)' }}
              data-testid="create-auction-button"
            >
              <Plus size={32} weight="bold" />
              <span className="ml-2 text-lg font-bold">Create Auction</span>
            </Button>
          </Card>
        </div>

        {/* Auctions List */}
        <div>
          <h2 className="text-3xl font-bold mb-6">My Auctions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <Card key={auction.id} className="glassmorphic p-6 cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => navigate(`/auction/${auction.id}`)} data-testid={`auction-card-${auction.id}`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{auction.name}</h3>
                  <span className={`glassmorphic-pill px-3 py-1 text-sm font-bold`} style={{ color: auction.status === 'active' ? 'var(--primary)' : 'white' }}>
                    {auction.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-white/70">Type: <span className="text-white font-semibold">{auction.type}</span></p>
                  <p className="text-white/70">Starting Price: <span className="mono text-white font-bold">${auction.starting_price}</span></p>
                  {auction.items && (
                    <p className="text-white/70">Items: <span className="text-white font-semibold">{auction.items.length}</span></p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateAuctionModal onClose={() => setShowCreateModal(false)} onSuccess={() => { setShowCreateModal(false); fetchAuctions(); }} />
      )}
    </div>
  );
};

export default ClientDashboard;