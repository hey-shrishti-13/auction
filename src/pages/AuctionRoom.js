import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useAuctionStore from '../store/auctionStore';
import { auctionAPI, bidAPI } from '../utils/api';
import socket from '../utils/socket';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, Gavel, Trophy, Clock } from '@phosphor-icons/react';

const AuctionRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentAuction, setCurrentAuction, topBidders, setTopBidders } = useAuctionStore();
  const [bidAmount, setBidAmount] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [bids, setBids] = useState([]);

  const isClient = user?.role === 'client';
  const isVendor = user?.role === 'vendor';
  const themeClass = isClient ? 'client-theme client-bg' : 'vendor-theme vendor-bg';

  const fetchAuctionDetails = React.useCallback(async () => {
    try {
      const { data } = await auctionAPI.getById(id);
      setCurrentAuction(data);
    } catch (error) {
      toast.error('Failed to load auction');
      navigate('/dashboard');
    }
  }, [id, setCurrentAuction, navigate]);

  const fetchBids = React.useCallback(async () => {
    try {
      const { data } = await bidAPI.getAuctionBids(id);
      setBids(data);
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  const fetchTopBidders = React.useCallback(async () => {
    try {
      const { data } = await bidAPI.getTopBidders(id);
      setTopBidders(data);
    } catch (error) {
      console.error(error);
    }
  }, [id, setTopBidders]);

  const handleNewBid = React.useCallback((data) => {
    fetchBids();
    fetchTopBidders();
    toast.success('New bid placed!');
  }, [fetchBids, fetchTopBidders]);

  const handleAuctionEnded = React.useCallback((data) => {
    toast.success('Auction has ended!');
    fetchAuctionDetails();
  }, [fetchAuctionDetails]);

  const handleTimerUpdate = (data) => {
    setTimeRemaining(data.timeRemaining);
  };

  useEffect(() => {
    fetchAuctionDetails();
    fetchBids();
    fetchTopBidders();

    socket.connect();
    socket.emit('joinAuction', id);

    socket.on('newBid', handleNewBid);
    socket.on('timerUpdate', handleTimerUpdate);
    socket.on('auctionEnded', handleAuctionEnded);

    return () => {
      socket.emit('leaveAuction', id);
      socket.off('newBid');
      socket.off('timerUpdate');
      socket.off('auctionEnded');
      socket.disconnect();
    };
  }, [id, fetchAuctionDetails, fetchBids, fetchTopBidders, handleNewBid, handleAuctionEnded]);

  useEffect(() => {
    if (currentAuction?.end_time) {
      const interval = setInterval(() => {
        const remaining = new Date(currentAuction.end_time) - new Date();
        if (remaining <= 0) {
          setTimeRemaining(0);
          clearInterval(interval);
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentAuction]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    try {
      await bidAPI.placeBid({
        auction_id: id,
        amount: parseFloat(bidAmount),
      });
      toast.success('Bid placed successfully!');
      setBidAmount('');
      fetchBids();
      fetchTopBidders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place bid');
    }
  };

  const handleStartAuction = async () => {
    try {
      const duration = prompt('Enter auction duration in hours (max 72):');
      if (duration) {
        await auctionAPI.start(id, parseFloat(duration));
        toast.success('Auction started!');
        fetchAuctionDetails();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start auction');
    }
  };

  const formatTime = (ms) => {
    if (!ms || ms <= 0) return '00:00:00';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentAuction) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className={`min-h-screen ${themeClass} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button onClick={() => navigate('/dashboard')} variant="ghost" data-testid="back-button">
            <ArrowLeft size={24} />
            <span className="ml-2">Back</span>
          </Button>
          
          <div className="glassmorphic-pill px-6 py-3" data-testid="auction-info-pane">
            <p className="text-sm text-white/70">Auction</p>
            <p className="text-lg font-bold">{currentAuction.name}</p>
          </div>

          {currentAuction.status === 'active' && (
            <div className="glassmorphic-pill px-6 py-3" data-testid="timer-display">
              <p className="text-sm text-white/70">Time Remaining</p>
              <p className="timer-display" style={{ color: 'var(--primary)' }}>
                {formatTime(timeRemaining)}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Auction Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glassmorphic p-6" data-testid="auction-details-card">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{currentAuction.name}</h1>
                  <div className="flex gap-4">
                    <span className="glassmorphic-pill px-4 py-1" style={{ color: 'var(--primary)' }}>
                      {currentAuction.type.toUpperCase()}
                    </span>
                    <span className="glassmorphic-pill px-4 py-1">
                      {currentAuction.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-white/70 text-sm">Starting Price</p>
                  <p className="text-2xl font-bold mono" style={{ color: 'var(--primary)' }}>
                    ${currentAuction.starting_price}
                  </p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Min Bid Increment</p>
                  <p className="text-2xl font-bold mono" style={{ color: 'var(--primary)' }}>
                    ${currentAuction.min_bid_increment}
                  </p>
                </div>
              </div>

              {currentAuction.items && currentAuction.items.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-3">Items</h3>
                  <div className="space-y-2">
                    {currentAuction.items.map((item, idx) => (
                      <div key={item.id || idx} className="glassmorphic-pill px-4 py-2">
                        <p className="font-semibold">{item.name}</p>
                        {item.description && <p className="text-sm text-white/70">{item.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isClient && currentAuction.status === 'draft' && (
                <Button
                  onClick={handleStartAuction}
                  className="w-full mt-4"
                  style={{ background: 'var(--primary)' }}
                  data-testid="start-auction-button"
                >
                  <Clock size={24} weight="bold" />
                  <span className="ml-2 text-lg font-bold">Start Auction</span>
                </Button>
              )}
            </Card>

            {/* Bid Form for Vendors */}
            {isVendor && currentAuction.status === 'active' && (
              <Card className="glassmorphic p-6" data-testid="bid-form">
                <h3 className="text-xl font-bold mb-4">Place Your Bid</h3>
                <form onSubmit={handlePlaceBid} className="flex gap-4">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter bid amount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="flex-1"
                    data-testid="bid-amount-input"
                  />
                  <Button
                    type="submit"
                    style={{ background: 'var(--primary)' }}
                    data-testid="place-bid-button"
                  >
                    <Gavel size={24} weight="bold" />
                    <span className="ml-2">Place Bid</span>
                  </Button>
                </form>
              </Card>
            )}
          </div>

          {/* Leaderboard */}
          <div>
            <Card className="glassmorphic p-6" data-testid="bid-leaderboard">
              <div className="flex items-center gap-2 mb-6">
                <Trophy size={32} style={{ color: 'var(--primary)' }} />
                <h3 className="text-2xl font-bold">Top Bidders</h3>
              </div>

              <div className="space-y-3">
                {topBidders.length > 0 ? (
                  topBidders.map((bidder, idx) => (
                    <div
                      key={idx}
                      className="glassmorphic-pill px-4 py-3 flex items-center justify-between"
                      data-testid={`top-bidder-${idx + 1}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                          style={{ background: 'var(--primary)' }}
                        >
                          {idx + 1}
                        </div>
                        <span className="font-semibold">{bidder.vendor_name}</span>
                      </div>
                      {isClient && (
                        <span className="mono font-bold" style={{ color: 'var(--primary)' }}>
                          ${bidder.amount}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-white/50">No bids yet</p>
                )}
              </div>

              {isClient && bids.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-bold mb-3">All Bids</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {bids.map((bid, idx) => (
                      <div key={bid.id || idx} className="glassmorphic-pill px-3 py-2 flex justify-between text-sm">
                        <span>{bid.vendor?.name || 'Vendor'}</span>
                        <span className="mono font-bold">${bid.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionRoom;