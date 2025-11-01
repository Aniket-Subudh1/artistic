'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Package, 
  DollarSign, 
  Plus, 
  X, 
  Eye,
  CheckCircle2,
  Settings,
  Camera,
  Lightbulb,
  Volume2,
  Monitor
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { Equipment, EquipmentService, EQUIPMENT_CATEGORIES } from '@/services/equipment.service';

interface EquipmentRentalFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onEquipmentSelected: (equipment: SelectedEquipment[]) => void;
  selectedEquipment: SelectedEquipment[];
  eventDate: string;
  eventDuration: number; // in hours
}

export interface SelectedEquipment {
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  pricePerUnit?: number;
  totalPrice?: number;
  notes?: string;
}

interface EquipmentWithPricing extends Equipment {
  calculatedPrice?: number;
  isAvailable?: boolean;
  availableQuantity?: number;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  SOUND: Volume2,
  DISPLAY: Monitor,
  LIGHT: Lightbulb,
  CAMERA: Camera,
  STAGING: Settings,
  POWER: Settings,
  TRANSPORT: Package,
  OTHER: Package
};

export default function EquipmentRentalFlow({
  isOpen,
  onClose,
  onEquipmentSelected,
  selectedEquipment,
  eventDate,
  eventDuration
}: EquipmentRentalFlowProps) {
  const [equipment, setEquipment] = useState<EquipmentWithPricing[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<EquipmentWithPricing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [availableOnly, setAvailableOnly] = useState(false);
  
  // Selection states
  const [tempSelectedEquipment, setTempSelectedEquipment] = useState<SelectedEquipment[]>(selectedEquipment);
  const [showEquipmentDetails, setShowEquipmentDetails] = useState<string | null>(null);
  const [equipmentQuantities, setEquipmentQuantities] = useState<Record<string, number>>({});

  // Load equipment
  useEffect(() => {
    if (isOpen) {
      loadEquipment();
    }
  }, [isOpen]);

  // Initialize quantities for selected equipment
  useEffect(() => {
    const quantities: Record<string, number> = {};
    selectedEquipment.forEach(item => {
      quantities[item.equipmentId] = item.quantity;
    });
    setEquipmentQuantities(quantities);
  }, [selectedEquipment]);

  // Filter equipment based on search and filters
  useEffect(() => {
    let filtered = [...equipment];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.provider.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Available only filter
    if (availableOnly) {
      filtered = filtered.filter(item => (item.availableQuantity || item.quantity) > 0);
    }

    // Price range filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(item => {
        const price = item.calculatedPrice || item.pricePerDay;
        const min = parseFloat(priceRange.min) || 0;
        const max = parseFloat(priceRange.max) || Infinity;
        return price >= min && price <= max;
      });
    }

    setFilteredEquipment(filtered);
  }, [equipment, searchTerm, categoryFilter, priceRange, availableOnly]);

  const loadEquipment = async () => {
    setLoading(true);
    setError(null);

    try {
      const allEquipment = await EquipmentService.getAllEquipment();
      
       // Calculate pricing based on event duration - equipment is always booked for full day
       const equipmentWithPricing: EquipmentWithPricing[] = allEquipment.map(item => {
         // Always use daily rate for equipment booking
         const calculatedPrice = item.pricePerDay;

        return {
          ...item,
          calculatedPrice,
          isAvailable: item.quantity > 0,
          availableQuantity: item.quantity
        };
      });

      setEquipment(equipmentWithPricing);
    } catch (err: any) {
      console.error('Failed to load equipment:', err);
      setError(err.message || 'Failed to load equipment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (equipmentId: string, quantity: number) => {
    setEquipmentQuantities(prev => ({
      ...prev,
      [equipmentId]: quantity
    }));
  };

  const handleAddEquipment = (equipment: EquipmentWithPricing) => {
    const quantity = equipmentQuantities[equipment._id] || 1;
    const maxQuantity = equipment.availableQuantity || equipment.quantity;
    
    if (quantity > maxQuantity) {
      setError(`Only ${maxQuantity} units available for ${equipment.name}`);
      return;
    }

    // Validate equipment data before creating selection
    if (!equipment._id || !equipment.name) {
      setError('Invalid equipment data. Please refresh and try again.');
      return;
    }

    const selectedItem: SelectedEquipment = {
      equipmentId: equipment._id,
      equipmentName: equipment.name,
      quantity,
      pricePerUnit: equipment.calculatedPrice || equipment.pricePerDay,
      totalPrice: (equipment.calculatedPrice || equipment.pricePerDay) * quantity
    };

    setTempSelectedEquipment(prev => {
      // Remove existing entry if present
      const filtered = prev.filter(item => item.equipmentId !== equipment._id);
      return [...filtered, selectedItem];
    });
  };

  const handleRemoveEquipment = (equipmentId: string) => {
    setTempSelectedEquipment(prev => prev.filter(item => item.equipmentId !== equipmentId));
    setEquipmentQuantities(prev => {
      const updated = { ...prev };
      delete updated[equipmentId];
      return updated;
    });
  };

  const updateEquipmentNotes = (equipmentId: string, notes: string) => {
    setTempSelectedEquipment(prev => 
      prev.map(item => 
        item.equipmentId === equipmentId 
          ? { ...item, notes } 
          : item
      )
    );
  };

  const handleConfirmSelection = () => {
    onEquipmentSelected(tempSelectedEquipment);
    onClose();
  };

  const isEquipmentSelected = (equipmentId: string) => {
    return tempSelectedEquipment.some(item => item.equipmentId === equipmentId);
  };

  const getCategoryIcon = (category: string) => {
    const IconComponent = CATEGORY_ICONS[category] || Package;
    return <IconComponent className="h-4 w-4" />;
  };

  const renderEquipmentCard = (equipment: EquipmentWithPricing) => {
    const isSelected = isEquipmentSelected(equipment._id);
    const selectedQuantity = equipmentQuantities[equipment._id] || 1;
    const maxQuantity = equipment.availableQuantity || equipment.quantity;
    const categoryInfo = EQUIPMENT_CATEGORIES.find(cat => cat.value === equipment.category);
    
    return (
      <Card 
        key={equipment._id} 
        className={`transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Equipment Image */}
            <div className="relative">
              <img
                src={equipment.imageUrl || '/placeholder-equipment.jpg'}
                alt={equipment.name}
                className="w-16 h-16 rounded-lg object-cover bg-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-equipment.jpg';
                }}
              />
              {isSelected && (
                <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-1">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {equipment.name}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {equipment.description}
                  </p>
                  
                  {/* Category */}
                  <div className="flex items-center gap-2 mt-1">
                    {getCategoryIcon(equipment.category)}
                    <span className="text-xs text-gray-500">
                      {categoryInfo?.label || equipment.category}
                    </span>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="font-semibold text-primary">
                    ${equipment.calculatedPrice || equipment.pricePerDay}
                  </div>
                   <div className="text-xs text-gray-500">
                     per day
                   </div>
                </div>
              </div>

              {/* Availability */}
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {maxQuantity > 0 ? (
                      <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
                        Out of Stock
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {maxQuantity} units
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Provider: {equipment.provider}
                  </div>
                </div>
              </div>

              {/* Quantity Selector and Actions */}
              {maxQuantity > 0 && (
                <div className="flex gap-2 mt-3">
                  <div className="flex items-center gap-2 flex-1">
                    <Label className="text-xs">Qty:</Label>
                    <Input
                      type="number"
                      min="1"
                      max={maxQuantity}
                      value={selectedQuantity}
                      onChange={(e) => handleQuantityChange(equipment._id, parseInt(e.target.value) || 1)}
                      className="w-20 h-8 text-sm"
                    />
                  </div>
                  
                  <Button
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleAddEquipment(equipment)}
                    className="flex-1"
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Update
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowEquipmentDetails(equipment._id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSelectedEquipment = () => {
    if (tempSelectedEquipment.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No equipment selected yet</p>
        </div>
      );
    }

    const totalCost = tempSelectedEquipment.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

    return (
      <div className="space-y-3">
        {tempSelectedEquipment.map((item) => (
          <Card key={item.equipmentId} className="bg-primary/5 border-primary/20">
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{item.equipmentName}</div>
                    <div className="text-sm text-gray-600">
                      {item.quantity} × ${item.pricePerUnit} = ${item.totalPrice}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveEquipment(item.equipmentId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Notes field */}
                <div>
                  <Textarea
                    placeholder="Add notes for this equipment..."
                    value={item.notes || ''}
                    onChange={(e) => updateEquipmentNotes(item.equipmentId, e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="bg-gray-50 rounded-lg p-3 border-2 border-dashed border-gray-300">
          <div className="flex items-center justify-between font-semibold">
            <span>Total Equipment Cost:</span>
            <span className="text-primary">${totalCost}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            For {eventDuration <= 8 ? `${eventDuration} hours` : `${Math.ceil(eventDuration / 24)} day(s)`}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Rent Equipment for Your Event
          </DialogTitle>
          <DialogDescription>
            Select equipment for {eventDate} ({eventDuration <= 8 ? `${eventDuration} hours` : `${Math.ceil(eventDuration / 24)} day(s)`})
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Equipment List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search equipment..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Categories</SelectItem>
                      {EQUIPMENT_CATEGORIES.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="availableOnly"
                      checked={availableOnly}
                      onChange={(e) => setAvailableOnly(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="availableOnly" className="text-sm">
                      Available only
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Min $"
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    />
                    <Input
                      placeholder="Max $"
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  Found {filteredEquipment.length} equipment items
                  {availableOnly && ` available`}
                </div>
              </CardContent>
            </Card>

            {/* Equipment Grid */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : filteredEquipment.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No equipment found matching your criteria</p>
                </div>
              ) : (
                filteredEquipment.map(renderEquipmentCard)
              )}
            </div>
          </div>

          {/* Selected Equipment Sidebar */}
          <div className="lg:col-span-1 border-l border-gray-200 pl-6">
            <div className="sticky top-0">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Selected Equipment ({tempSelectedEquipment.length})
              </h3>
              
              <div className="h-[500px] overflow-y-auto">
                {renderSelectedEquipment()}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirmSelection}>
            Confirm Selection ({tempSelectedEquipment.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
