'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Group, Text, Transformer } from 'react-konva';
import Konva from 'konva';
import {
  venueLayoutService,
  VenueLayout,
  SeatCategory,
  SeatMapItem,
  SeatMapItemType,
  TableShape,
} from '@/services/venue-layout.service';

// Import our new components
import CategoryManager from './venue-layout/CategoryManager';
import ZoomControls from './venue-layout/ZoomControls';
import ContextMenu, { ContextMenuIcons } from './venue-layout/ContextMenu';
import PropertiesPanel from './venue-layout/PropertiesPanel';
import { CanvasControls, EnhancedCanvas } from './venue-layout/EnhancedCanvas';
import BulkSeatCreator from './venue-layout/BulkSeatCreator';

interface Tool {
  id: string;
  name: string;
  type: SeatMapItemType;
  icon: string;
}

const tools: Tool[] = [
  { id: 'select', name: 'Select', type: SeatMapItemType.SEAT, icon: '⚫' },
  { id: 'seat', name: 'Seat', type: SeatMapItemType.SEAT, icon: '🪑' },
  { id: 'bulk-seat', name: 'Bulk Seats', type: SeatMapItemType.SEAT, icon: '🏟️' },
  { id: 'table', name: 'Table', type: SeatMapItemType.TABLE, icon: '🪧' },
  { id: 'booth', name: 'Booth', type: SeatMapItemType.BOOTH, icon: '🛏️' },
  { id: 'stage', name: 'Stage', type: SeatMapItemType.STAGE, icon: '🎭' },
  { id: 'washroom', name: 'Washroom', type: SeatMapItemType.WASHROOM, icon: '🚻' },
  { id: 'screen', name: 'Screen', type: SeatMapItemType.SCREEN, icon: '📺' },
  { id: 'entry', name: 'Entry', type: SeatMapItemType.ENTRY, icon: '🚪' },
  { id: 'exit', name: 'Exit', type: SeatMapItemType.EXIT, icon: '🚪' },
];

const VenueLayoutManagement: React.FC = () => {
  const [layouts, setLayouts] = useState<VenueLayout[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<VenueLayout | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Editor state
  const [layoutName, setLayoutName] = useState('');
  const [venueWidth, setVenueWidth] = useState(1200);
  const [venueHeight, setVenueHeight] = useState(800);
  const [widthInput, setWidthInput] = useState('1200');
  const [heightInput, setHeightInput] = useState('800');
  const [categories, setCategories] = useState<SeatCategory[]>([
    { id: '1', name: 'VIP', color: '#FFD700', price: 100 },
    { id: '2', name: 'Premium', color: '#C0C0C0', price: 75 },
    { id: '3', name: 'Standard', color: '#CD7F32', price: 50 },
  ]);
  const [seatMapItems, setSeatMapItems] = useState<SeatMapItem[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool>(tools[0]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // Canvas state
  const [zoom, setZoom] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(25);

  // Selection state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Context menu state
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });

  // Bulk seat creator state
  const [bulkSeatCreator, setBulkSeatCreator] = useState({
    visible: false,
    startX: 0,
    startY: 0,
  });

  // Undo/Redo state
  const [history, setHistory] = useState<SeatMapItem[][]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const transformerRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    fetchLayouts();
  }, []);

  useEffect(() => {
    if (selectedItemIds.length > 0 && transformerRef.current && stageRef.current) {
      const selectedNodes = selectedItemIds
        .map(id => stageRef.current?.findOne(`#${id}`))
        .filter(Boolean) as Konva.Node[];
      
      if (selectedNodes.length > 0) {
        transformerRef.current.nodes(selectedNodes);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedItemIds]);

  // Save state to history for undo/redo
  const saveToHistory = useCallback((items: SeatMapItem[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push([...items]);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  }, [history, historyStep]);

  // Update seat map items with history
  const updateSeatMapItems = useCallback((newItems: SeatMapItem[]) => {
    saveToHistory(seatMapItems);
    setSeatMapItems(newItems);
  }, [seatMapItems, saveToHistory]);

  // Keyboard shortcuts including Ctrl+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't handle shortcuts when typing in inputs
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteSelected();
      } else if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'a':
            e.preventDefault();
            handleSelectAll();
            break;
          case 'd':
            e.preventDefault();
            handleDuplicateSelected();
            break;
          case '0':
            e.preventDefault();
            handleResetZoom();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemIds, seatMapItems, history, historyStep]);

  const handleUndo = useCallback(() => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setSeatMapItems(history[historyStep - 1]);
      setSelectedItemIds([]);
    }
  }, [history, historyStep]);

  const handleRedo = useCallback(() => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setSeatMapItems(history[historyStep + 1]);
      setSelectedItemIds([]);
    }
  }, [history, historyStep]);

  const fetchLayouts = async () => {
    try {
      setLoading(true);
      const data = await venueLayoutService.getAllLayouts();
      setLayouts(data);
    } catch (error) {
      console.error('Failed to fetch layouts:', error);
      alert('Failed to fetch layouts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedLayout(null);
    setIsEditing(true);
    setLayoutName('');
    setVenueWidth(1200);
    setVenueHeight(800);
    setWidthInput('1200');
    setHeightInput('800');
    setSeatMapItems([]);
    setCategories([
      { id: '1', name: 'VIP', color: '#FFD700', price: 100 },
      { id: '2', name: 'Premium', color: '#C0C0C0', price: 75 },
      { id: '3', name: 'Standard', color: '#CD7F32', price: 50 },
    ]);
    setSelectedItemIds([]);
    setSelectedCategoryId('');
    setHistory([]);
    setHistoryStep(-1);
    handleResetZoom();
  };

  const handleEdit = (layout: VenueLayout) => {
    setSelectedLayout(layout);
    setIsEditing(true);
    setLayoutName(layout.name);
    setVenueWidth(layout.canvasW);
    setVenueHeight(layout.canvasH);
    setWidthInput(layout.canvasW.toString());
    setHeightInput(layout.canvasH.toString());
    setSeatMapItems(layout.items);
    setCategories(layout.categories);
    setSelectedItemIds([]);
    setSelectedCategoryId('');
    setHistory([layout.items]);
    setHistoryStep(0);
    handleResetZoom();
  };

  const handleSave = async () => {
    if (!layoutName.trim()) {
      alert('Please enter a layout name');
      return;
    }

    try {
      setLoading(true);
      const layoutData = {
        name: layoutName,
        items: seatMapItems,
        categories: categories,
        canvasW: venueWidth,
        canvasH: venueHeight,
      };

      if (selectedLayout) {
        await venueLayoutService.updateLayout(selectedLayout._id, layoutData);
        alert('Layout updated successfully');
      } else {
        await venueLayoutService.createLayout(layoutData);
        alert('Layout created successfully');
      }

      setIsEditing(false);
      fetchLayouts();
    } catch (error) {
      console.error('Failed to save layout:', error);
      alert('Failed to save layout');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this layout?')) return;

    try {
      setLoading(true);
      await venueLayoutService.deleteLayout(id);
      alert('Layout deleted successfully');
      fetchLayouts();
    } catch (error) {
      console.error('Failed to delete layout:', error);
      alert('Failed to delete layout');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      setLoading(true);
      await venueLayoutService.toggleActive(id);
      fetchLayouts();
    } catch (error) {
      console.error('Failed to toggle layout:', error);
      alert('Failed to toggle layout');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      setLoading(true);
      await venueLayoutService.duplicateLayout(id);
      alert('Layout duplicated successfully');
      fetchLayouts();
    } catch (error) {
      console.error('Failed to duplicate layout:', error);
      alert('Failed to duplicate layout');
    } finally {
      setLoading(false);
    }
  };

  // Zoom and canvas controls
  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const handleFitToScreen = useCallback(() => {
    if (!stageRef.current) return;
    
    const stage = stageRef.current;
    const containerWidth = stage.width();
    const containerHeight = stage.height();
    
    const scaleX = (containerWidth - 100) / venueWidth;
    const scaleY = (containerHeight - 100) / venueHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    
    setZoom(scale);
    setStagePos({
      x: (containerWidth - venueWidth * scale) / 2,
      y: (containerHeight - venueHeight * scale) / 2,
    });
  }, [venueWidth, venueHeight]);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setStagePos({ x: 50, y: 50 });
  }, []);

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    if (e.evt.ctrlKey || e.evt.metaKey) {
      // Zoom
      const scaleBy = 1.05;
      const stage = e.target.getStage();
      if (!stage) return;
      
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      
      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };
      
      const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
      const clampedScale = Math.max(0.1, Math.min(5, newScale));
      
      setZoom(clampedScale);
      
      const newPos = {
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      };
      setStagePos(newPos);
    } else {
      // Pan when not holding Ctrl
      const stage = e.target.getStage();
      if (!stage) return;
      
      const newPos = {
        x: stagePos.x - e.evt.deltaX,
        y: stagePos.y - e.evt.deltaY,
      };
      setStagePos(newPos);
    }
  }, [stagePos]);

  // Item management
  const getItemColor = (type: SeatMapItemType, categoryId?: string): string => {
    if (type === SeatMapItemType.SEAT && categoryId) {
      const category = categories.find((c) => c.id === categoryId);
      return category?.color || '#4CAF50';
    }

    const colors: Record<SeatMapItemType, string> = {
      [SeatMapItemType.SEAT]: '#4CAF50',
      [SeatMapItemType.TABLE]: '#8B4513',
      [SeatMapItemType.BOOTH]: '#FF6B6B',
      [SeatMapItemType.STAGE]: '#9C27B0',
      [SeatMapItemType.SCREEN]: '#FF9800',
      [SeatMapItemType.WASHROOM]: '#2196F3',
      [SeatMapItemType.ENTRY]: '#4CAF50',
      [SeatMapItemType.EXIT]: '#F44336',
    };
    return colors[type] || '#999';
  };

  const snapToGridValue = useCallback((value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  const handleStageMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // Handle context menu close
    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false });
      return;
    }

    const clickedOnEmpty = e.target === e.target.getStage();
    const clickedId = e.target.id();
    
    if (selectedTool.id === 'select') {
      if (clickedOnEmpty) {
        // Clear selection if not holding ctrl
        if (!e.evt.ctrlKey && !e.evt.metaKey) {
          setSelectedItemIds([]);
        }
        
        // Prepare for potential drag selection
        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;
        
        setSelectionRect({
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
        });
        setIsDragging(false);
      } else if (clickedId) {
        // Handle item selection
        if (e.evt.ctrlKey || e.evt.metaKey) {
          // Toggle selection
          setSelectedItemIds(prev => 
            prev.includes(clickedId) 
              ? prev.filter(id => id !== clickedId)
              : [...prev, clickedId]
          );
        } else {
          // Single selection
          setSelectedItemIds([clickedId]);
        }
      }
    }
  }, [selectedTool.id, contextMenu]);

  const handleStageMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (selectedTool.id !== 'select') return;
    
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;
    
    // Check if we've moved enough to start dragging
    const startPos = selectionRect;
    const distance = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
    
    if (distance > 3 && !isDragging) {
      setIsDragging(true);
      setIsSelecting(true);
    }
    
    if (isDragging) {
      setSelectionRect({
        x: Math.min(startPos.x, pos.x),
        y: Math.min(startPos.y, pos.y),
        width: Math.abs(pos.x - startPos.x),
        height: Math.abs(pos.y - startPos.y),
      });
    }
  }, [selectedTool.id, selectionRect, isDragging]);

  const handleStageMouseUp = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    
    if (selectedTool.id === 'select' && isSelecting && isDragging) {
      // Perform area selection
      if (selectionRect.width > 5 && selectionRect.height > 5) {
        const selectedIds: string[] = [];
        seatMapItems.forEach(item => {
          const itemBounds = {
            x: (item.x * zoom) + stagePos.x,
            y: (item.y * zoom) + stagePos.y,
            width: item.w * zoom,
            height: item.h * zoom,
          };
          
          // Check if item intersects with selection rectangle
          if (itemBounds.x + itemBounds.width > selectionRect.x &&
              itemBounds.x < selectionRect.x + selectionRect.width &&
              itemBounds.y + itemBounds.height > selectionRect.y &&
              itemBounds.y < selectionRect.y + selectionRect.height) {
            selectedIds.push(item.id);
          }
        });
        
        setSelectedItemIds(selectedIds);
      }
    } else if (selectedTool.id !== 'select' && clickedOnEmpty) {
      // Handle tool placement
      const stage = e.target.getStage();
      const pointerPosition = stage?.getPointerPosition();
      if (!pointerPosition) return;

      const snappedX = snapToGridValue(pointerPosition.x - stagePos.x) / zoom;
      const snappedY = snapToGridValue(pointerPosition.y - stagePos.y) / zoom;

      if (selectedTool.id === 'seat') {
        const categoryId = selectedCategoryId || categories[0]?.id || '';
        
        const newItem: SeatMapItem = {
          id: Date.now().toString(),
          type: SeatMapItemType.SEAT,
          x: snappedX,
          y: snappedY,
          w: 30,
          h: 30,
          categoryId,
          label: `S${seatMapItems.filter(i => i.type === SeatMapItemType.SEAT).length + 1}`,
        };
        updateSeatMapItems([...seatMapItems, newItem]);
      } else if (selectedTool.id === 'bulk-seat') {
        setBulkSeatCreator({
          visible: true,
          startX: snappedX,
          startY: snappedY,
        });
      } else if (selectedTool.id === 'table') {
        const newItem: SeatMapItem = {
          id: Date.now().toString(),
          type: SeatMapItemType.TABLE,
          x: snappedX,
          y: snappedY,
          w: 120,
          h: 80,
          shape: TableShape.RECT,
          label: `T${seatMapItems.filter(i => i.type === SeatMapItemType.TABLE).length + 1}`,
          tableSeats: 4,
        };
        updateSeatMapItems([...seatMapItems, newItem]);
      } else {
        const newItem: SeatMapItem = {
          id: Date.now().toString(),
          type: selectedTool.type,
          x: snappedX,
          y: snappedY,
          w: selectedTool.type === SeatMapItemType.SEAT ? 30 : 100,
          h: selectedTool.type === SeatMapItemType.SEAT ? 30 : 60,
          label: selectedTool.name,
        };
        updateSeatMapItems([...seatMapItems, newItem]);
      }
    }
    
    // Reset drag selection state
    setIsSelecting(false);
    setIsDragging(false);
    setSelectionRect({ x: 0, y: 0, width: 0, height: 0 });
  }, [selectedTool, isSelecting, isDragging, selectionRect, seatMapItems, zoom, stagePos, snapToGridValue, selectedCategoryId, categories, updateSeatMapItems]);

  const handleContextMenu = useCallback((e: Konva.KonvaEventObject<PointerEvent>) => {
    e.evt.preventDefault();
    
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    const clickedId = e.target.id();
    
    // If right-clicked on an item that's not selected, select it
    if (clickedId && !selectedItemIds.includes(clickedId)) {
      setSelectedItemIds([clickedId]);
    }

    setContextMenu({
      visible: true,
      x: pos.x,
      y: pos.y,
    });
  }, [selectedItemIds]);

  const handleSelectAll = useCallback(() => {
    setSelectedItemIds(seatMapItems.map(item => item.id));
  }, [seatMapItems]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedItemIds.length === 0) return;
    
    const updatedItems = seatMapItems.filter(item => !selectedItemIds.includes(item.id));
    updateSeatMapItems(updatedItems);
    setSelectedItemIds([]);
  }, [selectedItemIds, seatMapItems, updateSeatMapItems]);

  const handleDuplicateSelected = useCallback(() => {
    if (selectedItemIds.length === 0) return;
    
    const selectedItems = seatMapItems.filter(item => selectedItemIds.includes(item.id));
    const duplicatedItems = selectedItems.map(item => ({
      ...item,
      id: `${Date.now()}-${Math.random()}`,
      x: item.x + 50,
      y: item.y + 50,
    }));
    
    updateSeatMapItems([...seatMapItems, ...duplicatedItems]);
    setSelectedItemIds(duplicatedItems.map(item => item.id));
  }, [selectedItemIds, seatMapItems, updateSeatMapItems]);

  const handleBulkSeatCreation = useCallback((seats: SeatMapItem[]) => {
    updateSeatMapItems([...seatMapItems, ...seats]);
    setBulkSeatCreator({ visible: false, startX: 0, startY: 0 });
    // Auto-select the created seats
    setSelectedItemIds(seats.map(seat => seat.id));
  }, [seatMapItems, updateSeatMapItems]);

  const handleClearCanvas = useCallback(() => {
    if (!confirm('Are you sure you want to clear all items?')) return;
    updateSeatMapItems([]);
    setSelectedItemIds([]);
  }, [updateSeatMapItems]);

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>, itemId: string) => {
    const snappedX = snapToGridValue(e.target.x());
    const snappedY = snapToGridValue(e.target.y());
    
    const updatedItems = seatMapItems.map((item) =>
      item.id === itemId
        ? { ...item, x: snappedX, y: snappedY }
        : item
    );
    updateSeatMapItems(updatedItems);
  }, [seatMapItems, snapToGridValue, updateSeatMapItems]);

  const handleTransformEnd = useCallback((e: Konva.KonvaEventObject<Event>, itemId: string) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale
    node.scaleX(1);
    node.scaleY(1);

    const snappedX = snapToGridValue(node.x());
    const snappedY = snapToGridValue(node.y());
    const snappedW = snapToGridValue(Math.max(10, node.width() * scaleX));
    const snappedH = snapToGridValue(Math.max(10, node.height() * scaleY));

    const updatedItems = seatMapItems.map((item) =>
      item.id === itemId
        ? {
            ...item,
            x: snappedX,
            y: snappedY,
            w: snappedW,
            h: snappedH,
            rotation: node.rotation(),
          }
        : item
    );
    updateSeatMapItems(updatedItems);
  }, [seatMapItems, snapToGridValue, updateSeatMapItems]);

  const renderItem = useCallback((item: SeatMapItem) => {
    const isSelected = selectedItemIds.includes(item.id);
    const color = getItemColor(item.type, item.categoryId);

    if (item.type === SeatMapItemType.SEAT || (item.type === SeatMapItemType.TABLE && item.shape === TableShape.ROUND)) {
      return (
        <Group
          key={item.id}
          id={item.id}
          x={item.x}
          y={item.y}
          draggable={selectedTool.id === 'select'}
          onDragEnd={(e) => handleDragEnd(e, item.id)}
          onTransformEnd={(e) => handleTransformEnd(e, item.id)}
        >
          <Circle
            radius={item.w / 2}
            fill={color}
            stroke={isSelected ? '#0066ff' : '#000'}
            strokeWidth={isSelected ? 3 : 1}
          />
          {item.label && (
            <Text
              text={item.label}
              fontSize={12}
              fill="#000"
              x={-item.w / 4}
              y={-6}
              width={item.w / 2}
              align="center"
            />
          )}
        </Group>
      );
    }

    return (
      <Group
        key={item.id}
        id={item.id}
        x={item.x}
        y={item.y}
        rotation={item.rotation || 0}
        draggable={selectedTool.id === 'select'}
        onDragEnd={(e) => handleDragEnd(e, item.id)}
        onTransformEnd={(e) => handleTransformEnd(e, item.id)}
      >
        <Rect
          width={item.w}
          height={item.h}
          fill={color}
          stroke={isSelected ? '#0066ff' : '#000'}
          strokeWidth={isSelected ? 3 : 1}
        />
        {item.label && (
          <Text
            text={item.label}
            fontSize={12}
            fill="#000"
            x={0}
            y={item.h / 2 - 6}
            width={item.w}
            align="center"
          />
        )}
      </Group>
    );
  }, [selectedItemIds, selectedTool.id, handleDragEnd, handleTransformEnd]);

  const selectedItems = seatMapItems.filter(item => selectedItemIds.includes(item.id));

  const contextMenuItems = [
    {
      id: 'selectAll',
      label: 'Select All',
      icon: ContextMenuIcons.edit,
      onClick: handleSelectAll,
      disabled: seatMapItems.length === 0,
      separator: true,
    },
    {
      id: 'edit',
      label: 'Edit Properties',
      icon: ContextMenuIcons.edit,
      onClick: () => console.log('Edit properties'),
      disabled: selectedItemIds.length === 0,
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: ContextMenuIcons.duplicate,
      onClick: handleDuplicateSelected,
      disabled: selectedItemIds.length === 0,
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: ContextMenuIcons.delete,
      onClick: handleDeleteSelected,
      disabled: selectedItemIds.length === 0,
      separator: true,
    },
    {
      id: 'bringToFront',
      label: 'Bring to Front',
      icon: ContextMenuIcons.bringToFront,
      onClick: () => console.log('Bring to front'),
      disabled: selectedItemIds.length === 0,
    },
    {
      id: 'sendToBack',
      label: 'Send to Back',
      icon: ContextMenuIcons.sendToBack,
      onClick: () => console.log('Send to back'),
      disabled: selectedItemIds.length === 0,
    },
  ];

  if (!isEditing) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Venue Layouts</h1>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create New Layout
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : layouts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No layouts found. Create your first layout!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {layouts.map((layout) => (
              <div
                key={layout._id}
                className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{layout.name}</h3>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      layout.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {layout.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <div>Size: {layout.canvasW} × {layout.canvasH}</div>
                  <div>Items: {layout.items.length}</div>
                  <div>Categories: {layout.categories.length}</div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleEdit(layout)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(layout._id)}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  >
                    {layout.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDuplicate(layout._id)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleDelete(layout._id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-white">
        <h1 className="text-xl font-bold">
          {selectedLayout ? 'Edit Layout' : 'Create Layout'}
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Layout Name:</label>
            <input
              type="text"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              className="px-3 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter layout name"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
        <ZoomControls
          zoom={zoom}
          onZoomChange={handleZoomChange}
          onFitToScreen={handleFitToScreen}
          onResetZoom={handleResetZoom}
        />
        
        <CanvasControls
          showGrid={showGrid}
          onShowGridChange={setShowGrid}
          snapToGrid={snapToGrid}
          onSnapToGridChange={setSnapToGrid}
          gridSize={gridSize}
          onGridSizeChange={setGridSize}
          onClearCanvas={handleClearCanvas}
          onSelectAll={handleSelectAll}
          itemCount={seatMapItems.length}
        />

        {/* Undo/Redo Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={historyStep <= 0}
            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </button>
          <button
            onClick={handleRedo}
            disabled={historyStep >= history.length - 1}
            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Shift+Z)"
          >
            ↷ Redo
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r flex flex-col">
          {/* Tools */}
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-3">Tools</h3>
            <div className="grid grid-cols-3 gap-2">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                    selectedTool.id === tool.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                  title={tool.name}
                >
                  <span className="text-lg">{tool.icon}</span>
                  <span className="text-xs font-medium truncate w-full text-center">
                    {tool.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Manager */}
          <div className="p-4 border-b">
            <CategoryManager
              categories={categories}
              onCategoriesChange={setCategories}
              selectedCategoryId={selectedCategoryId}
              onCategorySelect={setSelectedCategoryId}
            />
          </div>

          {/* Canvas Settings */}
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-3">Canvas Size</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Width</label>
                <input
                  type="number"
                  min="100"
                  max="5000"
                  value={widthInput}
                  onChange={(e) => {
                    setWidthInput(e.target.value);
                    const numValue = parseInt(e.target.value);
                    if (numValue >= 100 && numValue <= 5000) {
                      setVenueWidth(numValue);
                    }
                  }}
                  onBlur={() => {
                    const numValue = parseInt(widthInput);
                    if (isNaN(numValue) || numValue < 100 || numValue > 5000) {
                      setWidthInput(venueWidth.toString());
                    }
                  }}
                  className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Height</label>
                <input
                  type="number"
                  min="100"
                  max="5000"
                  value={heightInput}
                  onChange={(e) => {
                    setHeightInput(e.target.value);
                    const numValue = parseInt(e.target.value);
                    if (numValue >= 100 && numValue <= 5000) {
                      setVenueHeight(numValue);
                    }
                  }}
                  onBlur={() => {
                    const numValue = parseInt(heightInput);
                    if (isNaN(numValue) || numValue < 100 || numValue > 5000) {
                      setHeightInput(venueHeight.toString());
                    }
                  }}
                  className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Properties Panel */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <PropertiesPanel
                selectedItems={selectedItems}
                categories={categories}
                onItemsUpdate={(updatedItems) => {
                  const updatedItemsMap = new Map(updatedItems.map(item => [item.id, item]));
                  const newItems = seatMapItems.map(item => 
                    updatedItemsMap.get(item.id) || item
                  );
                  updateSeatMapItems(newItems);
                }}
                onSelectionClear={() => setSelectedItemIds([])}
              />
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <EnhancedCanvas
            width={venueWidth}
            height={venueHeight}
            zoom={zoom}
            stagePos={stagePos}
            onStagePositionChange={setStagePos}
            showGrid={showGrid}
            snapToGrid={snapToGrid}
            gridSize={gridSize}
            onStageRef={(ref) => { stageRef.current = ref; }}
            onWheel={handleWheel}
            onMouseDown={handleStageMouseDown}
            onMouseMove={handleStageMouseMove}
            onMouseUp={handleStageMouseUp}
            onContextMenu={handleContextMenu}
            selectionRect={selectionRect}
            isSelecting={isSelecting}
          >
            {seatMapItems.map(renderItem)}
            
            {/* Transformer */}
            {selectedTool.id === 'select' && (
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // Limit resize
                  if (newBox.width < 10 || newBox.height < 10) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            )}
          </EnhancedCanvas>

          {/* Context Menu */}
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            items={contextMenuItems}
            onClose={() => setContextMenu({ ...contextMenu, visible: false })}
            visible={contextMenu.visible}
          />

          {/* Bulk Seat Creator */}
          <BulkSeatCreator
            isOpen={bulkSeatCreator.visible}
            onClose={() => setBulkSeatCreator({ visible: false, startX: 0, startY: 0 })}
            onCreateSeats={handleBulkSeatCreation}
            categories={categories}
            startX={bulkSeatCreator.startX}
            startY={bulkSeatCreator.startY}
          />
        </div>
      </div>
    </div>
  );
};

export default VenueLayoutManagement;