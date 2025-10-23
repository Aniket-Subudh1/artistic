"use client";
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, ChevronDown, ChevronUp, Edit3, Trash2, Plus } from 'lucide-react';

interface SeatCategory {
  id: string;
  name: string;
  color: string;
  price: number;
}

interface CategoryManagerProps {
  categories: SeatCategory[];
  onAdd: (category: Omit<SeatCategory, 'id'>) => void;
  onUpdate: (id: string, data: Partial<SeatCategory>) => void;
  onRemove: (id: string) => void;
  selectedId?: string;
  onSelect?: (id: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  categories, 
  onAdd, 
  onUpdate, 
  onRemove, 
  selectedId, 
  onSelect 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', color: '#10b981', price: 0 });

  const handleSubmit = useCallback(() => {
    if (!formData.name.trim()) {
      alert('Please enter a category name.');
      return;
    }
    if (!formData.color) {
      alert('Please pick a color.');
      return;
    }
    if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      alert('Please enter a valid non-negative price.');
      return;
    }

    if (editingId) {
      onUpdate(editingId, formData);
      setEditingId(null);
    } else {
      onAdd(formData);
    }

    setFormData({ name: '', color: '#10b981', price: 0 });
  }, [formData, editingId, onAdd, onUpdate]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const startEdit = useCallback((category: SeatCategory) => {
    setEditingId(category.id);
    setFormData({ name: category.name, color: category.color, price: category.price });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setFormData({ name: '', color: '#10b981', price: 0 });
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1 text-xs">
            <Palette className="h-3 w-3" />
            Categories ({categories.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 space-y-2">
          <div className="p-2 border rounded-lg bg-gray-50 space-y-1">
            <Input
              placeholder="Category name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              onKeyPress={handleKeyPress}
              className="text-xs h-7"
            />
            <div className="flex gap-1">
              <div className="flex-1">
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="h-6"
                />
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Price"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                  onKeyPress={handleKeyPress}
                  className="text-xs h-6"
                />
              </div>
            </div>
            <div className="flex gap-1">
              {editingId ? (
                <>
                  <Button size="sm" className="h-7 text-xs flex-1" onClick={handleSubmit}>Save</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={cancelEdit}>Cancel</Button>
                </>
              ) : (
                <Button size="sm" className="h-7 text-xs w-full" onClick={handleSubmit}>
                  <Plus className="h-3 w-3 mr-1" /> Add Category
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`flex items-center justify-between p-1 rounded border transition-colors ${
                  selectedId === category.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => onSelect?.(category.id)}
              >
                <div className="flex items-center gap-1 flex-1 cursor-pointer">
                  <div
                    className="w-3 h-3 rounded border"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-xs font-medium">{category.name}</span>
                  <span className="text-xs text-gray-500">KD {category.price}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(category);
                    }}
                    className="h-5 w-5 p-0"
                  >
                    <Edit3 className="h-2.5 w-2.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      const ok = window.confirm(`Delete category "${category.name}"? Items using it will switch to no category.`);
                      if (ok) onRemove(category.id);
                    }}
                    className="h-5 w-5 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default CategoryManager;