'use client';

import React, { useState } from 'react';
import { VenueProvider } from '@/services/venue-provider.service';
import { VenueLayout } from '@/services/venue-layout.service';
import { VenueProviderManagement } from './VenueProviderManagement';
import { VenueLayoutList } from './VenueLayoutList';
import VenueLayoutManagement from './VenueLayoutManagement';

type ViewMode = 'providers' | 'layouts' | 'editor';

interface EditorState {
  venueProvider: VenueProvider;
  layout?: VenueLayout; // undefined for new layout
}

export function VenueManagementOrchestrator() {
  const [viewMode, setViewMode] = useState<ViewMode>('providers');
  const [selectedProvider, setSelectedProvider] = useState<VenueProvider | null>(null);
  const [editorState, setEditorState] = useState<EditorState | null>(null);

  const handleViewLayouts = (provider: VenueProvider) => {
    setSelectedProvider(provider);
    setViewMode('layouts');
  };

  const handleBackToProviders = () => {
    setSelectedProvider(null);
    setViewMode('providers');
  };

  const handleEditLayout = (layout: VenueLayout) => {
    if (!selectedProvider) return;
    
    setEditorState({
      venueProvider: selectedProvider,
      layout: layout
    });
    setViewMode('editor');
  };

  const handleCreateNew = () => {
    if (!selectedProvider) return;
    
    setEditorState({
      venueProvider: selectedProvider,
      layout: undefined // undefined means new layout
    });
    setViewMode('editor');
  };

  const handleBackToLayouts = () => {
    setEditorState(null);
    setViewMode('layouts');
  };

  const handleBackToProvidersFromEditor = () => {
    setEditorState(null);
    setSelectedProvider(null);
    setViewMode('providers');
  };

  return (
    <div className="h-full">
      {viewMode === 'providers' && (
        <VenueProviderManagement onViewLayouts={handleViewLayouts} />
      )}
      
      {viewMode === 'layouts' && selectedProvider && (
        <VenueLayoutList
          venueProvider={selectedProvider}
          onBack={handleBackToProviders}
          onEditLayout={handleEditLayout}
          onCreateNew={handleCreateNew}
        />
      )}
      
      {viewMode === 'editor' && editorState && (
        <VenueLayoutManagement
          initialVenueProvider={editorState.venueProvider}
          initialLayout={editorState.layout}
          onBack={handleBackToLayouts}
        />
      )}
    </div>
  );
}