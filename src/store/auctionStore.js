import { create } from 'zustand';

const useAuctionStore = create((set) => ({
  auctions: [],
  activeAuctions: [],
  currentAuction: null,
  bids: [],
  topBidders: [],
  setAuctions: (auctions) => set({ auctions }),
  setActiveAuctions: (activeAuctions) => set({ activeAuctions }),
  setCurrentAuction: (currentAuction) => set({ currentAuction }),
  setBids: (bids) => set({ bids }),
  setTopBidders: (topBidders) => set({ topBidders }),
  addBid: (bid) => set((state) => ({ bids: [bid, ...state.bids] })),
  updateTopBidders: (bidders) => set({ topBidders: bidders }),
}));

export default useAuctionStore;