'use client';

import React, { useState } from 'react';
import { SeatCategory } from '@/services/venue-layout.service';

interface CategoryManagerProps {
  categories: SeatCategory[];
  onCategoriesChange: (categories: SeatCategory[]) => void;
  selectedCategoryId?: string;
  onCategorySelect?: (categoryId: string) => void;
}

interface CategoryFormData {
  name: string;
  color: string;
  price: number;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onCategoriesChange,
  selectedCategoryId,
  onCategorySelect,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SeatCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    color: '#4CAF50',
    price: 0,
  });

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({ name: '', color: '#4CAF50', price: 0 });
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: SeatCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      price: category.price,
    });
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (id: string) => {
    if (!confirm('Delete this category? Items using it will lose their category.')) return;
    
    const updatedCategories = categories.filter(c => c.id !== id);
    onCategoriesChange(updatedCategories);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    if (formData.price < 0) {
      alert('Price cannot be negative');
      return;
    }

    if (editingCategory) {
      // Update existing category
      const updatedCategories = categories.map(c =>
        c.id === editingCategory.id
          ? { ...c, ...formData }
          : c
      );
      onCategoriesChange(updatedCategories);
    } else {
      // Add new category
      const newCategory: SeatCategory = {
        id: Date.now().toString(),
        ...formData,
      };
      onCategoriesChange([...categories, newCategory]);
    }

    setIsModalOpen(false);
  };

  const handleDuplicateCategory = (category: SeatCategory) => {
    const newCategory: SeatCategory = {
      id: Date.now().toString(),
      name: `${category.name} Copy`,
      color: category.color,
      price: category.price,
    };
    onCategoriesChange([...categories, newCategory]);
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Seat Categories</h3>
        <button
          onClick={handleAddCategory}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          + Add
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          No categories yet. Add your first category!
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`flex items-center gap-2 p-3 border rounded-lg transition-all cursor-pointer ${
                selectedCategoryId === category.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onCategorySelect?.(category.id)}
            >
              <div
                className="w-8 h-8 rounded-lg flex-shrink-0 border-2 border-gray-300"
                style={{ backgroundColor: category.color }}
              />
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{category.name}</div>
                <div className="text-xs text-gray-600">${category.price}</div>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCategory(category);
                  }}
                  className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                  title="Edit category"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicateCategory(category);
                  }}
                  className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                  title="Duplicate category"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(category.id);
                  }}
                  className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                  title="Delete category"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-lg mx-4">
            <h3 className="text-lg font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., VIP, Premium, Standard"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#4CAF50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCategory ? 'Update' : 'Add'} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;