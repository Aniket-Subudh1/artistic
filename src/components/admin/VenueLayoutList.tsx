'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Copy,
  Calendar,
  Users,
  Grid,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VenueProvider } from '@/services/venue-provider.service';
import { venueLayoutService, VenueLayout } from '@/services/venue-layout.service';

interface VenueLayoutListProps {
  venueProvider: VenueProvider;
  onBack: () => void;
  onEditLayout: (layout: VenueLayout) => void;
  onCreateNew: () => void;
}

export function VenueLayoutList({ venueProvider, onBack, onEditLayout, onCreateNew }: VenueLayoutListProps) {
  const [layouts, setLayouts] = useState<VenueLayout[]>([]);
  const [filteredLayouts, setFilteredLayouts] = useState<VenueLayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadLayouts();
  }, [venueProvider]);

  useEffect(() => {
    filterLayouts();
  }, [layouts, searchTerm]);

  const loadLayouts = async () => {
    if (!venueProvider.profile?._id) {
      setError('Venue provider profile not found');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Loading layouts for venue provider profile ID:', venueProvider.profile._id);
      const layoutList = await venueLayoutService.getAllLayouts({ 
        venueOwnerId: venueProvider.profile._id 
      });
      setLayouts(layoutList);
      setError('');
    } catch (error: any) {
      console.error('Error loading layouts:', error);
      setError(error?.message || 'Failed to load layouts');
    } finally {
      setIsLoading(false);
    }
  };

  const filterLayouts = () => {
    if (!searchTerm) {
      setFilteredLayouts(layouts);
      return;
    }

    const filtered = layouts.filter(layout => 
      layout.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLayouts(filtered);
  };

  const handleDuplicate = async (layout: VenueLayout) => {
    try {
      const duplicatedLayout = await venueLayoutService.duplicateLayout(layout._id, `${layout.name} (Copy)`);
      setSuccess(`Layout "${layout.name}" duplicated successfully`);
      await loadLayouts(); // Refresh the list
    } catch (error: any) {
      setError(error?.message || 'Failed to duplicate layout');
    }
  };

  const handleDelete = async (layout: VenueLayout) => {
    if (!confirm(`Are you sure you want to delete the layout "${layout.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await venueLayoutService.deleteLayout(layout._id);
      setSuccess(`Layout "${layout.name}" deleted successfully`);
      await loadLayouts(); // Refresh the list
    } catch (error: any) {
      setError(error?.message || 'Failed to delete layout');
    }
  };

  const getSeatCount = (layout: VenueLayout): number => {
    return layout.items?.filter(item => item.type === 'seat').length || 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading layouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Providers
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Venue Layouts</h1>
            <p className="text-gray-600">
              {venueProvider.firstName} {venueProvider.lastName} — {venueProvider.profile?.category}
            </p>
          </div>
        </div>
        <Button onClick={onCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Layout
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search layouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {filteredLayouts.length} layout{filteredLayouts.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
          <CheckCircle className="h-4 w-4" />
          {success}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSuccess('')}
            className="ml-auto h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
          <AlertCircle className="h-4 w-4" />
          {error}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError('')}
            className="ml-auto h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      )}

      {/* Layouts Grid */}
      {filteredLayouts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Grid className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No layouts found' : 'No layouts yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Get started by creating your first venue layout'
              }
            </p>
            {!searchTerm && (
              <Button onClick={onCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Layout
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLayouts.map((layout) => (
            <Card key={layout._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold truncate">
                      {layout.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{getSeatCount(layout)} seats</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Layout Info */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Canvas Size</span>
                    <span className="font-medium">{layout.canvasW} × {layout.canvasH}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Categories</span>
                    <span className="font-medium">{layout.categories?.length || 0}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Created</span>
                    <span className="font-medium">
                      {new Date(layout.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => onEditLayout(layout)}
                      className="flex-1 gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(layout)}
                      title="Duplicate layout"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(layout)}
                      title="Delete layout"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}