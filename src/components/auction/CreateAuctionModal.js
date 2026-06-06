import React, { useState } from 'react';
import { auctionAPI } from '../../utils/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { toast } from 'sonner';
import { X, Plus, Trash } from '@phosphor-icons/react';

const CreateAuctionModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'unit',
    starting_price: '',
    min_bid_increment: '',
    is_private: false,
    items: [{ name: '', description: '' }],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.starting_price || !formData.min_bid_increment) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.items.some(item => !item.name)) {
      toast.error('All items must have a name');
      return;
    }

    try {
      await auctionAPI.create({
        ...formData,
        starting_price: parseFloat(formData.starting_price),
        min_bid_increment: parseFloat(formData.min_bid_increment),
      });
      toast.success('Auction created successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create auction');
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', description: '' }],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" data-testid="create-auction-modal">
      <Card className="glassmorphic text-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Create New Auction</h2>
          <Button onClick={onClose} variant="ghost" size="icon" data-testid="close-modal-button">
            <X size={24} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Auction Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Heavy Machinery Auction"
              required
              data-testid="auction-name-input"
            />
          </div>

          <div>
            <Label htmlFor="type">Auction Type *</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white"
              data-testid="auction-type-select"
            >
              <option value="unit">Unit (Single Item)</option>
              <option value="lot">Lot (Multiple Items)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="starting_price">Starting Price ($) *</Label>
              <Input
                id="starting_price"
                type="number"
                step="0.01"
                value={formData.starting_price}
                onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                placeholder="1000.00"
                required
                data-testid="starting-price-input"
              />
            </div>
            <div>
              <Label htmlFor="min_bid_increment">Min Bid Increment ($) *</Label>
              <Input
                id="min_bid_increment"
                type="number"
                step="0.01"
                value={formData.min_bid_increment}
                onChange={(e) => setFormData({ ...formData, min_bid_increment: e.target.value })}
                placeholder="50.00"
                required
                data-testid="min-bid-increment-input"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_private"
              checked={formData.is_private}
              onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
              className="w-4 h-4"
              data-testid="is-private-checkbox"
            />
            <Label htmlFor="is_private">Make this auction private</Label>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <Label>Items *</Label>
              <Button type="button" onClick={addItem} size="sm" data-testid="add-item-button">
                <Plus size={16} />
                <span className="ml-1">Add Item</span>
              </Button>
            </div>
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="glassmorphic-pill p-4" data-testid={`auction-item-${index}`}>
                  <div className="flex justify-between items-start mb-2">
                    <Label>Item {index + 1}</Label>
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeItem(index)}
                        variant="ghost"
                        size="sm"
                        data-testid={`remove-item-${index}`}
                      >
                        <Trash size={16} />
                      </Button>
                    )}
                  </div>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    placeholder="Item name"
                    className="mb-2"
                    required
                    data-testid={`item-name-${index}`}
                  />
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Description (optional)"
                    data-testid={`item-description-${index}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1" style={{ background: 'var(--primary)' }} data-testid="create-auction-submit">
              Create Auction
            </Button>
            <Button type="button" onClick={onClose} variant="outline" className="flex-1" data-testid="cancel-auction-create">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateAuctionModal;