"use client";
import React, { useState, useCallback, useMemo, useReducer, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VenueProvider, VenueProviderService } from '@/services/venue-provider.service';
import { venueLayoutService, VenueLayout as ApiVenueLayout, SeatMapItem as ApiSeatMapItem } from '@/services/venue-layout.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import BulkSeatCreator from './BulkSeatCreator';
import CategoryManager from './CategoryManager';
import BulkOperationsPanel from './BulkOperationsPanel';
import TableCreator, { TableCreationData } from './TableCreator';
import CurveArrangementPanel from './CurveArrangementPanel';
import SeatOverviewPanel from './SeatOverviewPanel';
import PriceOverviewPanel from './PriceOverviewPanel';
import SelectedItemDetailsPanel from './SelectedItemDetailsPanel';

// Import the bulk seat config type
interface BulkSeatConfig {
  rows: number;
  columns: number;
  seatSize: number;
  rowSpacing: number;
  columnSpacing: number;
  categoryId: string;
  startX: number;
  startY: number;
  rotation: number;
  rowDirection: 'A-Z' | 'Z-A' | '1-N' | 'N-1';
  numberDirection: '1-N' | 'N-1';
  skipPattern: 'none' | 'aisle-center' | 'aisle-sides' | 'custom';
  startingRow?: string;
}
import { 
  Plus, 
  Minus, 
  Save, 
  Eye, 
  Edit3, 
  Trash2, 
  RotateCw, 
  Grid,
  Palette,
  Settings,
  ChevronDown,
  ChevronUp,
  MapPin,
  DoorOpen,
  DoorClosed,
  Home,
  Monitor,
  Square,
  Circle,
  Triangle,
  Users,
  Target,
  Move,
  Layers,
  RefreshCw,
  Download,
  Upload,
  Maximize2,
  ZoomIn,
  ZoomOut,
  MousePointer2,
  Menu,
  X,
  Scale,
  Waves
} from 'lucide-react';

// Optimized Types for Large Venue Support
interface SeatCategory {
  id: string;
  name: string;
  color: string;
  price: number;
}

interface BaseItem {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number; // Changed from r to rotation
  metadata?: Record<string, any>; // Added metadata field for additional data
}

interface SeatItem extends BaseItem {
  type: 'seat';
  categoryId?: string; // Changed from cid to categoryId
  rowLabel?: string;  // Changed from rl to rowLabel
  seatNumber?: number; // Changed from sn to seatNumber
  label?: string; // Added label field for seat labeling
}

interface NonSeatItem extends BaseItem {
  type: 'entry' | 'exit' | 'washroom' | 'screen' | 'stage' | 'table' | 'booth';
  label?: string; // Changed from lbl to label
  shape?: string; // Changed from shp to shape
  categoryId?: string; // Optional category for non-seat items (booth/table pricing)
}

type VenueItem = SeatItem | NonSeatItem;

interface VenueLayout {
  id?: string;
  name: string;
  items: VenueItem[];
  categories: SeatCategory[];
  canvas: { w: number; h: number };
  meta?: {
    created?: string;
    updated?: string;
    version?: number;
  };
}

interface LayoutState extends VenueLayout {
  history: VenueLayout[];
  historyIndex: number;
}

interface ViewportInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

// Performance optimized rendering constants
const VIEWPORT_PADDING = 100;
const MAX_ITEMS_PER_FRAME = 300; // Reduced to prevent performance issues with 250+ seats
const SEAT_SIZE = 24;
const MIN_ZOOM = 0.1; // Allow more zoom out for large venues
const MAX_ZOOM = 5;   // Allow more zoom in for precision
const VIEWPORT_UPDATE_DEBOUNCE = 50; // ms
const RENDER_CHUNK_SIZE = 100; // Items to render per chunk - reduced for smoother progressive rendering

// Utility function for debouncing
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Curve arrangement interface
interface CurveConfig {
  centerX: number;
  centerY: number;
  radius: number;
  startAngle: number;
  endAngle: number;
  arrangementType: 'arc' | 'circle' | 'semi-circle';
}

// State Management with Reducer
type LayoutAction = 
  | { type: 'SET_LAYOUT'; payload: VenueLayout }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'ADD_ITEMS'; payload: VenueItem[] }
  | { type: 'REMOVE_ITEMS'; payload: string[] }
  | { type: 'UPDATE_ITEM'; payload: { id: string; data: Partial<VenueItem> } }
  | { type: 'UPDATE_ITEMS_NO_HISTORY'; payload: Array<{ id: string; data: Partial<VenueItem> }> }
  | { type: 'ADD_CATEGORY'; payload: SeatCategory }
  | { type: 'REMOVE_CATEGORY'; payload: string }
  | { type: 'UPDATE_CATEGORY'; payload: { id: string; data: Partial<SeatCategory> } }
  | { type: 'SET_CANVAS_SIZE'; payload: { w: number; h: number } }
  | { type: 'ROTATE_ITEMS'; payload: { ids: string[]; angle: number } }
  | { type: 'ARRANGE_IN_CURVE'; payload: { ids: string[]; config: CurveConfig } }
  | { type: 'BULK_UPDATE'; payload: { ids: string[]; data: Partial<VenueItem> } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE_STATE' };

const saveState = (state: LayoutState): LayoutState => {
  const currentLayout: VenueLayout = {
    id: state.id,
    name: state.name,
    items: [...state.items],
    categories: [...state.categories],
    canvas: { ...state.canvas },
    meta: state.meta
  };

  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(currentLayout);

  return {
    ...state,
    history: newHistory.slice(-50), // Keep last 50 states
    historyIndex: Math.min(newHistory.length - 1, 49)
  };
};

const layoutReducer = (state: LayoutState, action: LayoutAction): LayoutState => {
  switch (action.type) {
    case 'SET_LAYOUT':
      return {
        ...action.payload,
        history: [action.payload],
        historyIndex: 0
      };
    case 'SET_NAME':
      return {
        ...state,
        name: action.payload,
      };
    
    case 'SAVE_STATE':
      return saveState(state);
    
    case 'ADD_ITEMS':
      const newStateAdd = saveState(state);
      return {
        ...newStateAdd,
        items: [...newStateAdd.items, ...action.payload]
      };
    
    case 'REMOVE_ITEMS':
      const newStateRemove = saveState(state);
      return {
        ...newStateRemove,
        items: newStateRemove.items.filter(item => !action.payload.includes(item.id))
      };
    
    case 'UPDATE_ITEM':
      const newStateUpdate = saveState(state);
      return {
        ...newStateUpdate,
        items: newStateUpdate.items.map(item => 
          item.id === action.payload.id 
            ? { ...item, ...action.payload.data }
            : item
        )
      };
    
    case 'UPDATE_ITEMS_NO_HISTORY':
      return {
        ...state,
        items: state.items.map(item => {
          const update = action.payload.find(u => u.id === item.id);
          return update ? { ...item, ...update.data } : item;
        })
      };
    
    case 'ADD_CATEGORY':
      const newStateAddCat = saveState(state);
      return {
        ...newStateAddCat,
        categories: [...newStateAddCat.categories, action.payload]
      };
    
    case 'REMOVE_CATEGORY':
      const newStateRemoveCat = saveState(state);
      return {
        ...newStateRemoveCat,
        categories: newStateRemoveCat.categories.filter(cat => cat.id !== action.payload),
        items: newStateRemoveCat.items.map(item => 
          item.type === 'seat' && item.categoryId === action.payload
            ? { ...item, categoryId: undefined }
            : item
        )
      };
    
    case 'UPDATE_CATEGORY':
      const newStateUpdateCat = saveState(state);
      return {
        ...newStateUpdateCat,
        categories: newStateUpdateCat.categories.map(cat =>
          cat.id === action.payload.id
            ? { ...cat, ...action.payload.data }
            : cat
        )
      };
    
    case 'SET_CANVAS_SIZE':
      const newStateCanvas = saveState(state);
      return {
        ...newStateCanvas,
        canvas: action.payload
      };
    
    case 'ROTATE_ITEMS':
      const newStateRotate = saveState(state);
      return {
        ...newStateRotate,
        items: newStateRotate.items.map(item =>
          action.payload.ids.includes(item.id)
            ? { ...item, rotation: ((item.rotation || 0) + action.payload.angle) % 360 }
            : item
        )
      };
    
    case 'ARRANGE_IN_CURVE':
      const newStateCurve = saveState(state);
      const selectedItems = newStateCurve.items.filter(item => action.payload.ids.includes(item.id));
      const curveConfig = action.payload.config;
      
      // Calculate positions for items in a curved arrangement
      const curvedItems = selectedItems.map((item, index) => {
        let angle: number;
        
        switch (curveConfig.arrangementType) {
          case 'circle':
            // Full circle arrangement
            angle = (index / selectedItems.length) * 360;
            break;
          case 'semi-circle':
            // Semi-circle arrangement
            angle = curveConfig.startAngle + (index / Math.max(1, selectedItems.length - 1)) * 180;
            break;
          case 'arc':
          default:
            // Arc arrangement between start and end angles
            const totalAngle = curveConfig.endAngle - curveConfig.startAngle;
            angle = curveConfig.startAngle + (index / Math.max(1, selectedItems.length - 1)) * totalAngle;
            break;
        }
        
        // Convert angle to radians
        const radian = (angle * Math.PI) / 180;
        
        // Calculate new position
        const x = curveConfig.centerX + Math.cos(radian) * curveConfig.radius;
        const y = curveConfig.centerY + Math.sin(radian) * curveConfig.radius;
        
        // Calculate rotation to face the center (optional)
        const rotationToCenter = angle + 90; // Face inward
        
        return {
          ...item,
          x: x - item.w / 2,
          y: y - item.h / 2,
          rotation: rotationToCenter % 360
        };
      });
      
      return {
        ...newStateCurve,
        items: newStateCurve.items.map(item => {
          const curvedItem = curvedItems.find(ci => ci.id === item.id);
          return curvedItem || item;
        })
      };
    
    case 'BULK_UPDATE':
      const newStateBulk = saveState(state);
      return {
        ...newStateBulk,
        items: newStateBulk.items.map(item =>
          action.payload.ids.includes(item.id)
            ? { ...item, ...action.payload.data }
            : item
        )
      };
    
    case 'UNDO':
      if (state.historyIndex > 0) {
        const previousState = state.history[state.historyIndex - 1];
        return {
          ...previousState,
          history: state.history,
          historyIndex: state.historyIndex - 1
        };
      }
      return state;
    
    case 'REDO':
      if (state.historyIndex < state.history.length - 1) {
        const nextState = state.history[state.historyIndex + 1];
        return {
          ...nextState,
          history: state.history,
          historyIndex: state.historyIndex + 1
        };
      }
      return state;
    
    default:
      return state;
  }
};

// Enhanced SVG Seat Map Renderer Component with Viewport-Based Optimization
const SeatMapRenderer: React.FC<{
  layout: VenueLayout;
  selectedItems: string[];
  onItemClick: (id: string, multiSelect: boolean) => void;
  onItemsMove: (ids: string[], deltaX: number, deltaY: number) => void;
  onCanvasClick: (x: number, y: number) => void;
  onSelectionBoxDrag: (startX: number, startY: number, endX: number, endY: number) => void;
  onDragEnd: () => void;
  onMouseMove?: (x: number, y: number) => void;
  onSeatDoubleClick?: (seatId: string, event: React.MouseEvent) => void;
  zoom: number;
  showGrid: boolean;
  mode: 'admin' | 'user';
  bookedSeats?: string[];
  selectedTool?: string;
  pendingTableData?: TableCreationData | null;
  pendingBulkSeats?: BulkSeatConfig | null;
  previewMode?: boolean;
  previewData?: any;
  previewPosition?: { x: number; y: number };
}> = ({ 
  layout, 
  selectedItems, 
  onItemClick, 
  onItemsMove, 
  onCanvasClick,
  onSelectionBoxDrag,
  onDragEnd,
  onMouseMove,
  onSeatDoubleClick,
  zoom, 
  showGrid, 
  mode,
  bookedSeats = [],
  selectedTool = 'select',
  pendingTableData = null,
  pendingBulkSeats = null,
  previewMode = false,
  previewData = null,
  previewPosition = { x: 0, y: 0 }
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  // Track which IDs are being dragged at this moment to avoid selection race conditions
  const dragIdsRef = useRef<string[]>([]);
  
  // Viewport tracking for performance optimization
  const [viewportBounds, setViewportBounds] = useState<{ 
    x: number; y: number; width: number; height: number 
  }>({ x: 0, y: 0, width: layout.canvas.w, height: layout.canvas.h });
  
  // Visible items based on viewport (memoized for performance)
  const visibleItems = useMemo(() => {
    if (layout.items.length < MAX_ITEMS_PER_FRAME) {
      return layout.items; // Small venues don't need viewport culling
    }

    return layout.items.filter(item => {
      const itemRight = item.x + item.w;
      const itemBottom = item.y + item.h;
      const viewRight = viewportBounds.x + viewportBounds.width + VIEWPORT_PADDING;
      const viewBottom = viewportBounds.y + viewportBounds.height + VIEWPORT_PADDING;
      
      return !(
        itemRight < viewportBounds.x - VIEWPORT_PADDING ||
        item.x > viewRight ||
        itemBottom < viewportBounds.y - VIEWPORT_PADDING ||
        item.y > viewBottom
      );
    });
  }, [layout.items, viewportBounds]);

  // Update viewport bounds when zoom or pan changes
  const updateViewportBounds = useCallback((element: SVGSVGElement) => {
    const rect = element.getBoundingClientRect();
    const scroller = element.parentElement as HTMLElement | null;
    const scrollLeft = scroller?.scrollLeft || 0;
    const scrollTop = scroller?.scrollTop || 0;

    // Convert the scroller viewport and offsets into SVG units
    setViewportBounds({
      x: scrollLeft / zoom,
      y: scrollTop / zoom,
      width: rect.width / zoom,
      height: rect.height / zoom,
    });
  }, [zoom]);

  // Debounced viewport update
  const debouncedUpdateViewport = useMemo(
    () => debounce((element: SVGSVGElement) => updateViewportBounds(element), VIEWPORT_UPDATE_DEBOUNCE),
    [updateViewportBounds]
  );

  // Update viewport on zoom changes
  useEffect(() => {
    if (svgRef.current) {
      debouncedUpdateViewport(svgRef.current);
    }
  }, [zoom, debouncedUpdateViewport]);

  const getItemColor = useCallback((item: VenueItem) => {
    if (item.type === 'seat') {
      if (mode === 'user') {
        if (bookedSeats.includes(item.id)) return '#ef4444';
        if (selectedItems.includes(item.id)) return '#3b82f6';
      }
      
      const category = layout.categories.find(c => c.id === item.categoryId);
      return category?.color || '#10b981';
    }
    
    // If non-seat item has a category, use its color
    const nonSeatWithCat = (item as NonSeatItem).categoryId
      ? layout.categories.find(c => c.id === (item as NonSeatItem).categoryId)
      : undefined;
    if (nonSeatWithCat) {
      return nonSeatWithCat.color;
    }

    const colorMap: Record<string, string> = {
      entry: '#22c55e',
      exit: '#ef4444',
      washroom: '#3b82f6',
      screen: '#1f2937',
      stage: '#f59e0b',
      table: '#8b5cf6',
      booth: '#ec4899'
    };
    
    return colorMap[item.type] || '#6b7280';
  }, [layout.categories, mode, selectedItems, bookedSeats]);

  const getSVGCoordinates = useCallback((clientX: number, clientY: number) => {
    const svgEl = svgRef.current;
    if (!svgEl) return { x: 0, y: 0 };
    const rect = svgEl.getBoundingClientRect();

    const scroller = svgEl.parentElement as HTMLElement | null;
    const scrollLeft = scroller?.scrollLeft || 0;
    const scrollTop = scroller?.scrollTop || 0;

    return {
      x: (clientX - rect.left + scrollLeft) / zoom,
      y: (clientY - rect.top + scrollTop) / zoom
    };
  }, [zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent, itemId?: string) => {
    e.preventDefault();
    const { x, y } = getSVGCoordinates(e.clientX, e.clientY);
    
    if (itemId && mode === 'admin' && selectedTool === 'select') {
      const multiSelect = e.ctrlKey || e.metaKey;
      // If the clicked item is a table or a seat attached to a table, drag the entire group
      const clickedItem = layout.items.find(i => i.id === itemId);
      const clickedTableId = clickedItem?.type === 'table'
        ? clickedItem.id
        : (clickedItem?.type === 'seat' && (clickedItem as SeatItem).metadata?.tableId)
          ? (clickedItem as SeatItem).metadata!.tableId
          : null;
      const groupIds = clickedTableId
        ? layout.items
            .filter(i => i.id === clickedTableId || (i as any).metadata?.tableId === clickedTableId)
            .map(i => i.id)
        : [itemId];

      let idsToDrag: string[] = [];
      if (multiSelect) {
        if (selectedItems.some(id => groupIds.includes(id))) {
          idsToDrag = selectedItems;
        } else {
          // Add the clicked item to selection
          onItemClick(itemId, true);
          idsToDrag = Array.from(new Set([...selectedItems, ...groupIds]));
        }
      } else {
        // Single selection
        onItemClick(itemId, false);
        idsToDrag = groupIds;
      }

      dragIdsRef.current = Array.from(new Set(idsToDrag));
      setDragStart({ x, y });
      setIsDragging(true);
    } else if (!itemId && selectedTool === 'select') {
      setSelectionBox({ startX: x, startY: y, endX: x, endY: y });
      setIsSelecting(true);
    } else if (!itemId && selectedTool !== 'select') {
      onCanvasClick(x, y);
    }
  }, [mode, selectedTool, selectedItems, onItemClick, onCanvasClick, getSVGCoordinates, layout.items]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { x, y } = getSVGCoordinates(e.clientX, e.clientY);
    
    if (onMouseMove) {
      onMouseMove(x, y);
    }
    
    if (isDragging && dragStart && mode === 'admin') {
      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;
      
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        const ids = dragIdsRef.current.length ? dragIdsRef.current : selectedItems;
        onItemsMove(ids, deltaX, deltaY);
        setDragStart({ x, y });
      }
    } else if (isSelecting && selectionBox) {
      setSelectionBox({ ...selectionBox, endX: x, endY: y });
    }
  }, [isDragging, isSelecting, dragStart, selectionBox, mode, selectedItems, onItemsMove, getSVGCoordinates, onMouseMove]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isSelecting && selectionBox) {
      onSelectionBoxDrag(selectionBox.startX, selectionBox.startY, selectionBox.endX, selectionBox.endY);
      setIsSelecting(false);
      setSelectionBox(null);
    }
    
    if (isDragging) {
      onDragEnd();
    }
    
    setIsDragging(false);
    setDragStart(null);
    dragIdsRef.current = [];
  }, [isSelecting, selectionBox, onSelectionBoxDrag, isDragging, onDragEnd]);

  const renderGridPattern = () => {
    if (!showGrid) return null;
    
    return (
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
        </pattern>
      </defs>
    );
  };

  // Chunked rendering for large venues - Fixed progressive rendering
  const [renderChunkIndex, setRenderChunkIndex] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const renderingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const renderingRequestRef = useRef<number | null>(null);

  const renderChunks = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < visibleItems.length; i += RENDER_CHUNK_SIZE) {
      chunks.push(visibleItems.slice(i, i + RENDER_CHUNK_SIZE));
    }
    return chunks;
  }, [visibleItems]);

  // Improved progressive rendering with proper cleanup
  useEffect(() => {
    // Clean up any existing rendering process
    if (renderingTimeoutRef.current) {
      clearTimeout(renderingTimeoutRef.current);
      renderingTimeoutRef.current = null;
    }
    if (renderingRequestRef.current) {
      cancelAnimationFrame(renderingRequestRef.current);
      renderingRequestRef.current = null;
    }

    if (renderChunks.length > 1) {
      setIsRendering(true);
      setRenderChunkIndex(0);
      
      let currentChunk = 0;
      const startTime = Date.now();
      const maxRenderTime = 5000; // 5 seconds max for progressive rendering
      
      const renderNextChunk = () => {
        currentChunk++;
        setRenderChunkIndex(currentChunk);
        
        // Safety check: if too much time has passed, render everything at once
        if (Date.now() - startTime > maxRenderTime) {
          setRenderChunkIndex(renderChunks.length - 1);
          setIsRendering(false);
          renderingTimeoutRef.current = null;
          renderingRequestRef.current = null;
          return;
        }
        
        if (currentChunk < renderChunks.length - 1) {
          renderingRequestRef.current = requestAnimationFrame(() => {
            renderingTimeoutRef.current = setTimeout(renderNextChunk, 8); 
          });
        } else {
          setIsRendering(false);
          renderingTimeoutRef.current = null;
          renderingRequestRef.current = null;
        }
      };
      
      // Start the rendering process
      renderingRequestRef.current = requestAnimationFrame(() => {
        renderingTimeoutRef.current = setTimeout(renderNextChunk, 8);
      });
    } else {
      setIsRendering(false);
      setRenderChunkIndex(0);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (renderingTimeoutRef.current) {
        clearTimeout(renderingTimeoutRef.current);
        renderingTimeoutRef.current = null;
      }
      if (renderingRequestRef.current) {
        cancelAnimationFrame(renderingRequestRef.current);
        renderingRequestRef.current = null;
      }
    };
  }, [renderChunks.length]);

  const itemsToRender = useMemo(() => {
    if (renderChunks.length <= 1) {
      return visibleItems;
    }
    
    // Safety check: if rendering is taking too long, render all items
    if (renderChunkIndex >= renderChunks.length - 1 || !isRendering) {
      return visibleItems;
    }
    
    return renderChunks.slice(0, renderChunkIndex + 1).flat();
  }, [renderChunks, renderChunkIndex, visibleItems, isRendering]);

  const renderItem = useCallback((item: VenueItem) => {
    const color = getItemColor(item);
    const isSelected = selectedItems.includes(item.id);
    const isBooked = mode === 'user' && bookedSeats.includes(item.id);
    // In user mode, make tables clickable and seats clickable only if not part of a table
    const isClickable =
      mode === 'admin' ||
      (mode === 'user' && (
        item.type === 'table' || (item.type === 'seat' && !(item as SeatItem).metadata?.tableId)
      ) && !isBooked);
    
    const commonProps = {
      transform: `translate(${item.x}, ${item.y}) rotate(${item.rotation || 0}, ${item.w/2}, ${item.h/2})`,
      style: { 
        cursor: isClickable ? 'pointer' : 'default',
        opacity: isBooked ? 0.6 : 1
      },
      onMouseDown: (e: React.MouseEvent) => {
        if (!isClickable) return;
        // In user mode, if this is a seat that belongs to a table, act as if the table was clicked
        if (
          mode === 'user' &&
          item.type === 'seat' &&
          (item as SeatItem).metadata?.tableId
        ) {
          const tableId = (item as SeatItem).metadata!.tableId as string;
          handleMouseDown(e, tableId);
          return;
        }
        handleMouseDown(e, item.id);
      },
      onDoubleClick: (e: React.MouseEvent) => isClickable && item.type === 'seat' && mode === 'admin' && onSeatDoubleClick && onSeatDoubleClick(item.id, e),
    };

    if (item.type === 'seat') {
      const seatItem = item as SeatItem;
      const label = seatItem.label || 
                   (seatItem.rowLabel && seatItem.seatNumber ? `${seatItem.rowLabel}${seatItem.seatNumber}` : item.id.slice(-3));
      
      return (
        <g key={item.id} {...commonProps}>
          <circle
            cx={item.w/2}
            cy={item.h/2}
            r={Math.min(item.w, item.h)/2 - 1}
            fill={color}
            stroke={isSelected ? '#1d4ed8' : '#374151'}
            strokeWidth={isSelected ? 2 : 1}
            className={isClickable ? 'hover:stroke-blue-500 transition-colors' : ''}
          />
          <text
            x={item.w/2}
            y={item.h/2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="10"
            fill="#fff"
            fontWeight="500"
          >
            {label}
          </text>
        </g>
      );
    }

    const nonSeatItem = item as NonSeatItem;
    
    // Enhanced table rendering with different shapes
    if (nonSeatItem.type === 'table') {
      // Be tolerant: read shape from metadata first, then top-level shape, otherwise default to square
      const shape = (nonSeatItem as any).metadata?.shape || (nonSeatItem as any).shape || 'square';
      const centerX = item.w / 2;
      const centerY = item.h / 2;
      
      return (
        <g key={item.id} {...commonProps}>
          {shape === 'round' && (
            <circle
              cx={centerX}
              cy={centerY}
              r={Math.min(item.w, item.h) / 2 - 1}
              fill={color}
              stroke={isSelected ? '#1d4ed8' : '#374151'}
              strokeWidth={isSelected ? 2 : 1}
              opacity="0.8"
            />
          )}
          {(shape === 'square' || shape === 'rectangle') && (
            <rect
              width={item.w}
              height={item.h}
              fill={color}
              stroke={isSelected ? '#1d4ed8' : '#374151'}
              strokeWidth={isSelected ? 2 : 1}
              rx="4"
              opacity="0.8"
            />
          )}
          {shape === 'triangle' && (
            <polygon
              points={`${centerX},0 0,${item.h} ${item.w},${item.h}`}
              fill={color}
              stroke={isSelected ? '#1d4ed8' : '#374151'}
              strokeWidth={isSelected ? 2 : 1}
              opacity="0.8"
            />
          )}
          {shape === 'semi-circle' && (
            <path
              d={`M 0 ${centerY} A ${item.w / 2} ${item.h} 0 0 1 ${item.w} ${centerY} L ${item.w} ${item.h} L 0 ${item.h} Z`}
              fill={color}
              stroke={isSelected ? '#1d4ed8' : '#374151'}
              strokeWidth={isSelected ? 2 : 1}
              opacity="0.8"
            />
          )}
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="8"
            fill="#fff"
            fontWeight="500"
          >
            {nonSeatItem.label || item.type}
          </text>
        </g>
      );
    }
    
    // Regular non-seat items (not tables)
    return (
      <g key={item.id} {...commonProps}>
        <rect
          width={item.w}
          height={item.h}
          fill={color}
          stroke={isSelected ? '#1d4ed8' : '#374151'}
          strokeWidth={isSelected ? 2 : 1}
          rx="2"
          opacity="0.8"
        />
        <text
          x={item.w/2}
          y={item.h/2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="8"
          fill="#fff"
          fontWeight="500"
        >
          {nonSeatItem.label || item.type}
        </text>
      </g>
    );
  }, [getItemColor, selectedItems, mode, bookedSeats, handleMouseDown]);

  // Render preview items (table and seats)
  const renderPreviewItems = useCallback(() => {
    if (!previewData || !previewPosition) return null;

    const scaledTableSize = {
      width: previewData.tableSize.width * (previewData.scale || 1),
      height: previewData.tableSize.height * (previewData.scale || 1)
    };

    const tableX = previewPosition.x - scaledTableSize.width / 2;
    const tableY = previewPosition.y - scaledTableSize.height / 2;
    const rotation = previewData.rotation || 0;

    // Calculate seat positions around the table
    const calculateSeatPositions = (shape: string, seatCount: number, width: number, height: number) => {
      const positions: Array<{ x: number; y: number }> = [];
      const centerX = width / 2;
      const centerY = height / 2;
      const seatRadius = 12;

      switch (shape) {
        case 'round': {
          const tableRadius = Math.min(width, height) / 2;
          const seatDistance = tableRadius + seatRadius;
          
          for (let i = 0; i < seatCount; i++) {
            const angle = (2 * Math.PI * i) / seatCount - Math.PI / 2;
            positions.push({
              x: centerX + Math.cos(angle) * seatDistance,
              y: centerY + Math.sin(angle) * seatDistance
            });
          }
          break;
        }
        case 'square':
        case 'rectangle': {
          const perimeter = 2 * (width + height);
          const spacing = perimeter / seatCount;
          
          for (let i = 0; i < seatCount; i++) {
            const distance = i * spacing;
            let x = 0, y = 0;
            
            if (distance <= width) {
              x = distance - seatRadius;
              y = -seatRadius;
            } else if (distance <= width + height) {
              x = width + seatRadius;
              y = distance - width - seatRadius;
            } else if (distance <= 2 * width + height) {
              x = width - (distance - width - height) + seatRadius;
              y = height + seatRadius;
            } else {
              x = -seatRadius;
              y = height - (distance - 2 * width - height) + seatRadius;
            }
            positions.push({ x, y });
          }
          break;
        }
        default:
          break;
      }
      return positions;
    };

    const seatPositions = calculateSeatPositions(previewData.shape, previewData.seatCount, scaledTableSize.width, scaledTableSize.height);

    return (
      <g opacity="0.6">
        {/* Preview Table */}
        <g transform={`translate(${tableX}, ${tableY}) rotate(${rotation}, ${scaledTableSize.width/2}, ${scaledTableSize.height/2})`}>
          {previewData.shape === 'round' && (
            <circle
              cx={scaledTableSize.width/2}
              cy={scaledTableSize.height/2}
              r={Math.min(scaledTableSize.width, scaledTableSize.height)/2 - 1}
              fill="#8b5cf6"
              stroke="#7c3aed"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}
          {(previewData.shape === 'square' || previewData.shape === 'rectangle') && (
            <rect
              width={scaledTableSize.width}
              height={scaledTableSize.height}
              fill="#8b5cf6"
              stroke="#7c3aed"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}
          <text
            x={scaledTableSize.width/2}
            y={scaledTableSize.height/2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="10"
            fill="#fff"
            fontWeight="500"
          >
            {previewData.tableLabel || 'Table'}
          </text>
        </g>
        
        {/* Preview Seats */}
        {seatPositions.map((pos, index) => (
          <g 
            key={`preview-seat-${index}`}
            transform={`translate(${tableX + pos.x - 12}, ${tableY + pos.y - 12}) rotate(${rotation}, 12, 12)`}
          >
            <circle
              cx={12}
              cy={12}
              r={10}
              fill="#10b981"
              stroke="#059669"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <text
              x={12}
              y={12}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="6"
              fill="#fff"
            >
              {index + 1}
            </text>
          </g>
        ))}
      </g>
    );
  }, [previewData, previewPosition]);

  return (
    <div className="relative overflow-auto border rounded-lg bg-gray-50 h-full w-full max-w-full">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${layout.canvas.w} ${layout.canvas.h}`}
        className="bg-white min-h-full"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          maxWidth: 'none',
          cursor: (selectedTool === 'table-placement' || selectedTool === 'bulk-seat-placement') ? 'crosshair' : 'default'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseDown={(e) => handleMouseDown(e)}
      >
        {renderGridPattern()}
        {showGrid && (
          <rect width="100%" height="100%" fill="url(#grid)" />
        )}
        
        {/* Optimized Rendering with Viewport Culling and Chunking */}
        {itemsToRender.map(renderItem)}
        
        {/* Loading indicator for chunked rendering */}
        {isRendering && renderChunks.length > 1 && (
          <g>
            <rect
              x={layout.canvas.w - 160}
              y={10}
              width={150}
              height={30}
              fill="rgba(255, 255, 255, 0.9)"
              stroke="#e5e7eb"
              strokeWidth="1"
              rx="4"
            />
            <text
              x={layout.canvas.w - 85}
              y={25}
              fill="#374151"
              fontSize="12"
              textAnchor="middle"
              fontWeight="500"
            >
              Loading seats...
            </text>
            <text
              x={layout.canvas.w - 85}
              y={37}
              fill="#6b7280"
              fontSize="10"
              textAnchor="middle"
            >
              {Math.round((renderChunkIndex + 1) / renderChunks.length * 100)}%
            </text>
          </g>
        )}
        
        {/* Preview Mode Rendering */}
        {previewMode && previewData && renderPreviewItems()}
        
        {/* Selection Box */}
        {isSelecting && selectionBox && (
          <rect
            x={Math.min(selectionBox.startX, selectionBox.endX)}
            y={Math.min(selectionBox.startY, selectionBox.endY)}
            width={Math.abs(selectionBox.endX - selectionBox.startX)}
            height={Math.abs(selectionBox.endY - selectionBox.startY)}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="#3b82f6"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        )}
      </svg>
    </div>
  );
};

// Tool Palette Component
const ToolPalette: React.FC<{
  selectedTool: string;
  onToolSelect: (tool: string) => void;
  selectedCategoryId: string;
  onRequestCreateTable?: () => void;
}> = ({ selectedTool, onToolSelect, selectedCategoryId, onRequestCreateTable }) => {
  const tools = [
    { id: 'select', name: 'Select', icon: MousePointer2, description: 'Select and move items' },
    { id: 'seat', name: 'Seat', icon: Circle, description: 'Add individual seats', requiresCategory: true },
    { id: 'table', name: 'Table', icon: Square, description: 'Add tables', requiresCategory: true },
    { id: 'booth', name: 'Booth', icon: Users, description: 'Add booths', requiresCategory: true },
    { id: 'stage', name: 'Stage', icon: Triangle, description: 'Add stage area' },
    { id: 'screen', name: 'Screen', icon: Monitor, description: 'Add screen/projection' },
    { id: 'entry', name: 'Entry', icon: DoorOpen, description: 'Add entry point' },
    { id: 'exit', name: 'Exit', icon: DoorClosed, description: 'Add exit point' },
    { id: 'washroom', name: 'Washroom', icon: Home, description: 'Add washroom' },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-1">
          <Settings className="h-3 w-3" />
          Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-1">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            const isDisabled = tool.requiresCategory && !selectedCategoryId;
            
            return (
              <Button
                key={tool.id}
                variant={selectedTool === tool.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  if (isDisabled) return;
                  if (tool.id === 'table' && onRequestCreateTable) {
                    onRequestCreateTable();
                    return;
                  }
                  onToolSelect(tool.id);
                }}
                disabled={isDisabled}
                className="h-12 flex flex-col gap-0.5 p-1 text-xs"
                title={isDisabled ? 'Select a category first' : tool.description}
              >
                <IconComponent className="h-3 w-3" />
                <span className="text-xs leading-none">{tool.name}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Interface for component props
interface VenueLayoutManagementProps {
  initialVenueProvider?: VenueProvider;
  initialLayout?: ApiVenueLayout;
  onBack?: () => void;
  // When true, this component is rendered for a venue owner (not admin) to edit their own layout
  // This hides admin-only controls like re-associating owners and the owner-edit permission toggle
  isOwnerEditing?: boolean;
  // Optionally set the initial UI mode (admin/user). Defaults to 'admin'.
  initialMode?: 'admin' | 'user';
  // Show or hide the Admin/User toggle buttons. Defaults to true.
  showModeToggle?: boolean;
}

// Main Dynamic Venue System Component
const DynamicVenueSystem: React.FC<VenueLayoutManagementProps> = ({ 
  initialVenueProvider, 
  initialLayout, 
  onBack,
  isOwnerEditing,
  initialMode,
  showModeToggle = true,
}) => {
  const [layout, dispatch] = useReducer(layoutReducer, {
    id: undefined,
    name: 'New Venue Layout',
    items: [],
    categories: [],
    canvas: { w: 1200, h: 800 },
    history: [],
    historyIndex: -1
  });

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showBulkCreator, setShowBulkCreator] = useState(false);
  const [showTableCreator, setShowTableCreator] = useState(false);
  const [showCurvePanel, setShowCurvePanel] = useState(false);
  const [mode, setMode] = useState<'admin' | 'user'>(initialMode ?? 'admin');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dragInProgress, setDragInProgress] = useState(false);
  const [pendingTableData, setPendingTableData] = useState<TableCreationData | null>(null);
  // Admin control: allow owner edit
  const [allowOwnerEdit, setAllowOwnerEdit] = useState<boolean>(Boolean((initialLayout as any)?.ownerCanEdit));
  useEffect(() => {
    setAllowOwnerEdit(Boolean((initialLayout as any)?.ownerCanEdit));
  }, [initialLayout]);
  // Ensure there is a dedicated category for a given item type, create if missing
  const ensureItemCategory = useCallback((type: 'table' | 'booth', fallbackPrice?: number): { id: string; created: boolean } => {
    // Try to find an existing category scoped to this type
    const existing = layout.categories.find(c => (c as any).appliesTo === type);
    if (existing) return { id: existing.id, created: false };

    // If not found, create a new one with a sensible default
    const newId = `${type}_cat_${Math.random().toString(36).slice(2, 8)}`;
    let price = typeof fallbackPrice === 'number' && fallbackPrice > 0 ? fallbackPrice : 0;
    if (!price) {
      const p = window.prompt(`Enter default price for ${type} category:`, '');
      if (p !== null) {
        const parsed = parseFloat(p);
        if (!isNaN(parsed) && parsed > 0) price = parsed;
      }
    }

    const newCat = { id: newId, name: type === 'table' ? 'Tables' : 'Booths', color: type === 'table' ? '#8b5cf6' : '#10b981', price, appliesTo: type } as any;
    // Use ADD_CATEGORY to avoid resetting layout history/state
    dispatch({ type: 'ADD_CATEGORY', payload: newCat });
    console.debug('ensureItemCategory created', newCat);
    return { id: newId, created: true };
  }, [layout, dispatch]);
  const [pendingBulkSeats, setPendingBulkSeats] = useState<any>(null);
  // Association with venue owner
  const [owners, setOwners] = useState<VenueProvider[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>(initialVenueProvider?.profile?._id || "");
  const [providerLayouts, setProviderLayouts] = useState<ApiVenueLayout[]>([]);
  const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(initialLayout?._id || null);
  const [isLoadingLayouts, setIsLoadingLayouts] = useState<boolean>(false);
  
  // Preview mode state
  const [previewMode, setPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const [groupId, setGroupId] = useState<string | null>(null);
  
  // Seat editing state
  const [editingSeatId, setEditingSeatId] = useState<string | null>(null);
  const [editingSeatNumber, setEditingSeatNumber] = useState<string>('');
  const [editingRowLabel, setEditingRowLabel] = useState<string>('');
  // Prevent double default-category creation in React Strict Mode
  const defaultCategoryInitRef = useRef(false);
  // Fast seat numbering for rapid clicks without waiting for state
  const rapidSeatRef = useRef<{ rowLabel: string; nextNumber: number; ts: number } | null>(null);

  // Auto-select first category when available and create default category if none exist
  useEffect(() => {
    // Only run the default-category creation once on mount
    if (!defaultCategoryInitRef.current && layout.categories.length === 0) {
      defaultCategoryInitRef.current = true;
      const defaultCategory = {
        id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}_default`,
        name: 'General',
        color: '#10b981',
        price: 50
      } as SeatCategory;
      dispatch({ type: 'ADD_CATEGORY', payload: defaultCategory });
    }

    // Ensure a valid selected category is always set
    if (
      layout.categories.length > 0 &&
      (!selectedCategoryId || !layout.categories.some(c => c.id === selectedCategoryId))
    ) {
      setSelectedCategoryId(layout.categories[0].id);
    }
  }, [layout.categories, selectedCategoryId]);

  // Initialize layout from props if provided
  useEffect(() => {
    const init = async () => {
      if (!initialLayout || layout.id) return;

      console.log('Initializing layout from props:', initialLayout);

      // If items are missing (list endpoint often omits them), fetch full layout by id
      if (!initialLayout.items || initialLayout.items.length === 0) {
        try {
          const full = await venueLayoutService.getLayoutById(initialLayout._id);
          dispatch({ type: 'SET_LAYOUT', payload: {
            id: full._id,
            name: full.name,
            items: (full.items || []).map(item => ({
              ...item,
              id: item.id || `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
            })) as any,
            categories: full.categories as any,
            canvas: { w: full.canvasW, h: full.canvasH },
            meta: { created: full.createdAt, updated: full.updatedAt, version: 1 },
          }});
          setSelectedLayoutId(full._id);
          // Prefer venueOwnerId from layout if provided
          if (full.venueOwnerId && !selectedOwnerId) {
            setSelectedOwnerId(full.venueOwnerId);
          }
          return;
        } catch (e) {
          console.warn('Failed to fetch full layout, falling back to provided data', e);
        }
      }

      // Otherwise, use provided layout as-is, normalizing table shape into metadata
      const transformedItems = initialLayout.items.map(item => ({
        ...item,
        id: item.id || `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        ...(item.type === 'table' ? {
          metadata: {
            ...(item as any).metadata,
            shape: (item as any).shape || (item as any).metadata?.shape,
            seatCount: (item as any).tableSeats ?? (item as any).metadata?.seatCount,
          }
        } : {})
      }));

      const transformedLayout = {
        id: initialLayout._id,
        name: initialLayout.name,
        items: transformedItems,
        categories: initialLayout.categories,
        canvas: { w: initialLayout.canvasW, h: initialLayout.canvasH },
        meta: {
          created: initialLayout.createdAt,
          updated: initialLayout.updatedAt
        }
      };

      dispatch({ type: 'SET_LAYOUT', payload: transformedLayout });
      setSelectedLayoutId(initialLayout._id);
      if (initialLayout.venueOwnerId && !selectedOwnerId) {
        setSelectedOwnerId(initialLayout.venueOwnerId);
      }
    };

    init();
  }, [initialLayout, layout.id, selectedOwnerId]);

  // Debug logging for initialization
  useEffect(() => {
    console.log('VenueLayoutManagement props:', {
      initialVenueProvider: initialVenueProvider ? {
        id: initialVenueProvider._id,
        name: `${initialVenueProvider.firstName} ${initialVenueProvider.lastName}`,
        profileId: initialVenueProvider.profile?._id
      } : null,
      initialLayout: initialLayout ? {
        id: initialLayout._id,
        name: initialLayout.name
      } : null,
      selectedOwnerId
    });
  }, [initialVenueProvider, initialLayout, selectedOwnerId]);

  // Item click handler
  const handleItemClick = useCallback((id: string, multiSelect: boolean) => {
    // Expand selection to include table groups (table + its seats)
    setSelectedItems(prev => {
      // Determine group for the clicked id (table id or seat's tableId)
      const clickedItem = layout.items.find(i => i.id === id);
      const tableId = clickedItem?.type === 'table'
        ? clickedItem.id
        : (clickedItem?.type === 'seat' && (clickedItem as SeatItem).metadata?.tableId) ? (clickedItem as SeatItem).metadata!.tableId : null;

      const groupIds = tableId
        ? layout.items
            .filter(i => i.id === tableId || (i as any).metadata?.tableId === tableId)
            .map(i => i.id)
        : [id];

      if (multiSelect) {
        // Toggle all group ids as a unit
        const isAllSelected = groupIds.every(gid => prev.includes(gid));
        if (isAllSelected) {
          return prev.filter(pid => !groupIds.includes(pid));
        }
        return Array.from(new Set([...prev, ...groupIds]));
      } else {
        // Select only this group
        const isSame = groupIds.length === prev.length && groupIds.every(gid => prev.includes(gid));
        return isSame ? [] : groupIds;
      }
    });
  }, [layout.items]);

  // Selection box handler
  const handleSelectionBoxDrag = useCallback((startX: number, startY: number, endX: number, endY: number) => {
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);
    
    const itemsInBox = layout.items.filter(item => {
      const itemCenterX = item.x + item.w / 2;
      const itemCenterY = item.y + item.h / 2;
      return itemCenterX >= minX && itemCenterX <= maxX && itemCenterY >= minY && itemCenterY <= maxY;
    });
    
    setSelectedItems(itemsInBox.map(item => item.id));
  }, [layout.items]);

  // Canvas click handler for adding items
  const handleCanvasClick = useCallback((x: number, y: number) => {
    // Handle preview mode confirmation
    if (previewMode) {
      handleConfirmPreview();
      return;
    }

    // Handle table placement mode
    if (selectedTool === 'table-placement' && pendingTableData) {
      handleCreateTable(pendingTableData, x, y);
      setPendingTableData(null);
      setSelectedTool('select');
      return;
    }

    // Handle bulk seat placement mode
    if (selectedTool === 'bulk-seat-placement' && pendingBulkSeats) {
      const seats = generateBulkSeatsAtPosition(pendingBulkSeats, x, y);
      dispatch({ type: 'ADD_ITEMS', payload: seats });
      setPendingBulkSeats(null);
      setSelectedTool('select');
      return;
    }

    if (selectedTool === 'select') return;

    const baseSize = { w: 40, h: 40 };
    let newItem: VenueItem;

    if (selectedTool === 'seat') {
      if (!selectedCategoryId) return;
      
      // Get optimal seat position (smart sequential numbering)
      let optimalPosition = getOptimalSeatPosition();
      // Enhance with rapid-click local sequence to avoid stale state issues
      const now = Date.now();
      if (rapidSeatRef.current && now - rapidSeatRef.current.ts < 1500) {
        optimalPosition = {
          rowLabel: rapidSeatRef.current.rowLabel,
          seatNumber: String(rapidSeatRef.current.nextNumber)
        };
      }
      
      newItem = {
        id: `seat_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'seat',
        x: Math.max(0, Math.min(layout.canvas.w - 24, x - 12)),
        y: Math.max(0, Math.min(layout.canvas.h - 24, y - 12)),
        w: 24,
        h: 24,
        categoryId: selectedCategoryId,
        rowLabel: optimalPosition.rowLabel,
        seatNumber: parseInt(optimalPosition.seatNumber),
        label: `${optimalPosition.rowLabel}${optimalPosition.seatNumber}`
      };
      // Update rapid-click sequence for the next click
      rapidSeatRef.current = {
        rowLabel: optimalPosition.rowLabel,
        nextNumber: (parseInt(optimalPosition.seatNumber) || 0) + 1,
        ts: now
      };
    } else {
      const sizes: Record<string, { w: number; h: number }> = {
        table: { w: 40, h: 40 },
        booth: { w: 80, h: 40 },
        stage: { w: 120, h: 60 },
        screen: { w: 100, h: 30 },
        entry: { w: 40, h: 40 },
        exit: { w: 40, h: 40 },
        washroom: { w: 40, h: 40 }
      };

      const size = sizes[selectedTool] || baseSize;
      // Auto-number booths in sequence (Booth 1, Booth 2, ...)
      let computedLabel = selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1);
      if (selectedTool === 'booth') {
        const existingNumbers = layout.items
          .filter(i => i.type === 'booth' && typeof (i as NonSeatItem).label === 'string')
          .map(i => {
            const match = /booth\s*(\d+)/i.exec((i as NonSeatItem).label as string);
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter(n => !isNaN(n));
        const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
        computedLabel = `Booth ${nextNumber}`;
      }
      
      // We'll compute the effective category id right before creating the item (after booth price prompt if needed)
      
      // For booth, require a price
      let boothPrice: number | undefined = undefined;
      if (selectedTool === 'booth') {
        const p = window.prompt('Enter booth price:', '');
        if (p === null) {
          return; // cancelled
        }
        const parsed = parseFloat(p);
        if (isNaN(parsed) || parsed <= 0) {
          alert('Please enter a valid positive price for the booth.');
          return;
        }
        boothPrice = parsed;
      }

      // Compute effective category id for table/booth without relying on async state update
      let effectiveCategoryId: string | undefined = undefined;
      if (selectedTool === 'table' || selectedTool === 'booth') {
        const selectedCat = layout.categories.find(c => c.id === selectedCategoryId) as any;
        const selectedScope = selectedCat?.appliesTo ?? 'seat';
        const mismatched = !selectedCat || selectedScope !== selectedTool;
        if (mismatched) {
          const ensured = ensureItemCategory(selectedTool as 'table' | 'booth', boothPrice);
          setSelectedCategoryId(ensured.id);
          effectiveCategoryId = ensured.id;
        } else {
          effectiveCategoryId = selectedCategoryId;
        }
        console.debug('Create item category resolve', { selectedTool, selectedCategoryId, selectedCat, selectedScope, mismatched, effectiveCategoryId });
      }

      newItem = {
        id: `${selectedTool}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: selectedTool as any,
        x: Math.max(0, Math.min(layout.canvas.w - size.w, x - size.w/2)),
        y: Math.max(0, Math.min(layout.canvas.h - size.h, y - size.h/2)),
        w: size.w,
        h: size.h,
        label: computedLabel,
        // Assign category to non-seat items that need pricing (tables/booths)
        categoryId: (selectedTool === 'table' || selectedTool === 'booth') ? effectiveCategoryId : undefined,
        metadata: {
          ...(selectedTool === 'booth' ? { price: boothPrice } : {})
        }
      };
      console.debug('New item created', newItem);
    }

    dispatch({ type: 'ADD_ITEMS', payload: [newItem] });
  }, [selectedTool, selectedCategoryId, layout.canvas, layout.items, pendingTableData, pendingBulkSeats]);

  // Item move handler
  const handleItemsMove = useCallback((ids: string[], deltaX: number, deltaY: number) => {
    // Save state only when drag starts, not during each move
    if (!dragInProgress) {
      dispatch({ type: 'SAVE_STATE' });
      setDragInProgress(true);
    }
    
    // Prepare updates for all items
    const updates = ids.map(id => {
      const item = layout.items.find(i => i.id === id);
      if (item) {
        return {
          id,
          data: {
            x: Math.max(0, Math.min(layout.canvas.w - item.w, item.x + deltaX)),
            y: Math.max(0, Math.min(layout.canvas.h - item.h, item.y + deltaY))
          }
        };
      }
      return null;
    }).filter(Boolean) as Array<{ id: string; data: Partial<VenueItem> }>;
    
    // Update items without saving to history during drag
    dispatch({
      type: 'UPDATE_ITEMS_NO_HISTORY',
      payload: updates
    });
  }, [layout.items, layout.canvas, dragInProgress]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDragInProgress(false);
  }, []);

  // Fetch venue owners for association (admin only)
  useEffect(() => {
    let mounted = true;
    VenueProviderService.getAllVenueProviders()
      .then(res => {
        if (!mounted) return;
        const data = (res as any)?.data || [];
        setOwners(data);
      })
      .catch(() => {
        // ignore
      });
    return () => { mounted = false; };
  }, []);

  // Fetch layouts for selected venue provider
  useEffect(() => {
    let cancelled = false;
    if (selectedOwnerId) {
      console.log('Fetching layouts for venue owner ID:', selectedOwnerId);
      setIsLoadingLayouts(true);
      venueLayoutService.getAllLayouts({ venueOwnerId: selectedOwnerId })
        .then(list => {
          console.log('Fetched layouts:', list);
          if (!cancelled) {
            setProviderLayouts(list);
            setSelectedLayoutId(null);
          }
        })
        .catch(error => {
          console.error('Error fetching layouts:', error);
          if (!cancelled) {
            setProviderLayouts([]);
          }
        })
        .finally(() => { if (!cancelled) setIsLoadingLayouts(false); });
    } else {
      setProviderLayouts([]);
      setSelectedLayoutId(null);
    }
    return () => { cancelled = true; };
  }, [selectedOwnerId]);

  // Table creation handler
  const handleCreateTable = useCallback((tableData: TableCreationData, x: number, y: number) => {
    // Enforce table price
    if (typeof tableData.tablePrice !== 'number' || tableData.tablePrice <= 0) {
      alert('Table price is required and must be a positive number.');
      return;
    }
    // Ensure category for table exists and matches scope; if none or mismatched, create/reuse scoped category and assign
    if (!tableData.categoryId) {
      const ensured = ensureItemCategory('table', tableData.tablePrice);
      tableData = { ...tableData, categoryId: ensured.id };
    } else {
      const selectedCat = layout.categories.find(c => c.id === tableData.categoryId) as any;
      const selectedScope = selectedCat?.appliesTo ?? 'seat';
      if (!selectedCat || selectedScope !== 'table') {
        const ensured = ensureItemCategory('table', tableData.tablePrice);
        tableData = { ...tableData, categoryId: ensured.id };
      }
    }
    const tableId = `table_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const items: VenueItem[] = [];
    const groupIdLocal = `group_${tableId}`;
    
    // Create the table
    const table: VenueItem = {
      id: tableId,
      type: 'table',
      x: x - tableData.tableSize.width / 2,
      y: y - tableData.tableSize.height / 2,
      w: tableData.tableSize.width,
      h: tableData.tableSize.height,
      rotation: 0,
      label: tableData.tableLabel || `Table ${tableId.slice(-4)}`,
      // Assign category for table pricing
      categoryId: tableData.categoryId,
      metadata: {
        shape: tableData.shape,
        seatCount: tableData.seatCount,
        groupId: groupIdLocal,
        price: tableData.tablePrice
      }
    };
    items.push(table);
    
    // Calculate seat positions around the table
    const seatPositions = calculateSeatPositions(
      tableData.shape,
      tableData.seatCount,
      tableData.tableSize.width,
      tableData.tableSize.height
    );
    
    // Create seats around the table
    seatPositions.forEach((pos, index) => {
      const seatId = `seat_${tableId}_${index}`;
      const seat: VenueItem = {
        id: seatId,
        type: 'seat',
        x: table.x + pos.x - 12, // 12 is half seat size (24/2)
        y: table.y + pos.y - 12,
        w: 24,
        h: 24,
        rotation: 0,
        categoryId: tableData.categoryId,
        label: `${index + 1}`,
        metadata: {
          tableId: tableId,
          seatNumber: index + 1,
          groupId: groupIdLocal
        }
      };
      items.push(seat);
    });
    
    // Add all items to the layout
    dispatch({ type: 'ADD_ITEMS', payload: items });
  }, []);
  
  // Helper function to calculate seat positions (same as in TableCreator)
  const calculateSeatPositions = useCallback((
    shape: TableCreationData['shape'], 
    seatCount: number, 
    width: number, 
    height: number
  ): Array<{ x: number; y: number }> => {
    const positions: Array<{ x: number; y: number }> = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const seatRadius = 18; // Slightly tighter to keep seats organized near the table
  
    switch (shape) {
      case 'round': {
        const tableRadius = Math.min(width, height) / 2;
        const seatDistance = tableRadius + seatRadius;
        
        for (let i = 0; i < seatCount; i++) {
          const angle = (2 * Math.PI * i) / seatCount - Math.PI / 2; // Start from top
          positions.push({
            x: centerX + Math.cos(angle) * seatDistance,
            y: centerY + Math.sin(angle) * seatDistance
          });
        }
        break;
      }
  
      case 'square':
      case 'rectangle': {
        // Distribute seats evenly across sides with a small corner margin
        const sides = [width, height, width, height];
        const total = seatCount;
        const perSide = [0, 0, 0, 0];
        for (let i = 0; i < total; i++) perSide[i % 4]++;
        const cornerMargin = 8;

        // Top side (left to right)
        for (let i = 0; i < perSide[0]; i++) {
          const x = (cornerMargin + (i + 0.5) * ((width - 2 * cornerMargin) / perSide[0]));
          const y = -seatRadius;
          positions.push({ x, y });
        }
        // Right side (top to bottom)
        for (let i = 0; i < perSide[1]; i++) {
          const x = width + seatRadius;
          const y = (cornerMargin + (i + 0.5) * ((height - 2 * cornerMargin) / perSide[1]));
          positions.push({ x, y });
        }
        // Bottom side (right to left)
        for (let i = 0; i < perSide[2]; i++) {
          const x = width - (cornerMargin + (i + 0.5) * ((width - 2 * cornerMargin) / perSide[2]));
          const y = height + seatRadius;
          positions.push({ x, y });
        }
        // Left side (bottom to top)
        for (let i = 0; i < perSide[3]; i++) {
          const x = -seatRadius;
          const y = height - (cornerMargin + (i + 0.5) * ((height - 2 * cornerMargin) / perSide[3]));
          positions.push({ x, y });
        }
        break;
      }
  
      case 'triangle': {
        const side1 = Math.sqrt(Math.pow(centerX, 2) + Math.pow(height, 2)); // Left side
        const side2 = width; // Bottom side  
        const side3 = Math.sqrt(Math.pow(centerX, 2) + Math.pow(height, 2)); // Right side
        const perimeter = side1 + side2 + side3;
        const spacing = perimeter / seatCount;
        
        for (let i = 0; i < seatCount; i++) {
          const distance = i * spacing;
          let x, y;
          
          if (distance <= side1) {
            // Left edge
            const t = distance / side1;
            x = centerX * (1 - t) - seatRadius * 0.7;
            y = height * t - seatRadius * 0.7;
          } else if (distance <= side1 + side2) {
            // Bottom edge
            const t = (distance - side1) / side2;
            x = t * width;
            y = height + seatRadius;
          } else {
            // Right edge
            const t = (distance - side1 - side2) / side3;
            x = width - centerX * t + seatRadius * 0.7;
            y = height - height * t - seatRadius * 0.7;
          }
          
          positions.push({ x, y });
        }
        break;
      }
  
      case 'semi-circle': {
        // Seats only on the curved part
        const radius = width / 2;
        
        for (let i = 0; i < seatCount; i++) {
          const angle = Math.PI * i / (seatCount - 1); // 0 to π
          positions.push({
            x: centerX + Math.cos(angle) * (radius + seatRadius),
            y: centerY + Math.sin(angle) * (radius + seatRadius)
          });
        }
        break;
      }
    }
  
    return positions;
  }, []);
  
  // Handle table placement start
  const handleStartTablePlacement = useCallback((tableData: TableCreationData) => {
    setPendingTableData(tableData);
    setSelectedTool('table-placement');
  }, []);

  // Handle bulk seat placement start
  const handleStartBulkSeatPlacement = useCallback((config: BulkSeatConfig) => {
    setPendingBulkSeats(config);
    setSelectedTool('bulk-seat-placement');
  }, []);

  // Preview mode handlers
  const handleStartPreview = useCallback((tableData: TableCreationData & { rotation: number; scale: number }) => {
    setPreviewMode(true);
    setPreviewData(tableData);
    setGroupId(`group_${Date.now()}`);
  }, []);

  const handleUpdatePreview = useCallback((tableData: TableCreationData & { rotation: number; scale: number; position: { x: number; y: number } }) => {
    setPreviewData(tableData);
    setPreviewPosition(tableData.position);
  }, []);

  const handleCancelPreview = useCallback(() => {
    setPreviewMode(false);
    setPreviewData(null);
    setPreviewPosition({ x: 0, y: 0 });
    setGroupId(null);
  }, []);

  const handleConfirmPreview = useCallback(() => {
    if (previewData && groupId) {
      if (typeof previewData.tablePrice !== 'number' || previewData.tablePrice <= 0) {
        alert('Table price is required and must be a positive number.');
        return;
      }
      // Create table and seats at preview position with preview settings
      const scaledTableSize = {
        width: previewData.tableSize.width * previewData.scale,
        height: previewData.tableSize.height * previewData.scale
      };
      
      const tableId = `table_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const items: VenueItem[] = [];
      
      // Create the table
      const table: VenueItem = {
        id: tableId,
        type: 'table',
        x: previewPosition.x - scaledTableSize.width / 2,
        y: previewPosition.y - scaledTableSize.height / 2,
        w: scaledTableSize.width,
        h: scaledTableSize.height,
        rotation: previewData.rotation || 0,
        label: previewData.tableLabel || `Table ${tableId.slice(-4)}`,
        metadata: {
          shape: previewData.shape,
          seatCount: previewData.seatCount,
          groupId: groupId,
          price: previewData.tablePrice
        }
      };
      items.push(table);
      
      // Calculate seat positions around the table
      const seatPositions = calculateSeatPositions(
        previewData.shape, 
        previewData.seatCount, 
        scaledTableSize.width,
        scaledTableSize.height
      );
      
      // Create seats around the table
      seatPositions.forEach((pos, index) => {
        const seatId = `seat_${tableId}_${index}`;
        const seat: VenueItem = {
          id: seatId,
          type: 'seat',
          x: table.x + pos.x - 12, // 12 is half seat size (24/2)
          y: table.y + pos.y - 12,
          w: 24,
          h: 24,
          rotation: previewData.rotation || 0,
          categoryId: previewData.categoryId,
          label: `${index + 1}`,
          metadata: {
            tableId: tableId,
            seatNumber: index + 1,
            groupId: groupId
          }
        };
        items.push(seat);
      });
      
      // Save state and add all items
      dispatch({ type: 'SAVE_STATE' });
      dispatch({ type: 'ADD_ITEMS', payload: items });
      
      setPreviewMode(false);
      setPreviewData(null);
      setPreviewPosition({ x: 0, y: 0 });
      setGroupId(null);
    }
  }, [previewData, previewPosition, groupId, calculateSeatPositions]);

  // Handle mouse movement for preview position tracking
  const handleMouseMoveForPreview = useCallback((x: number, y: number) => {
    if (previewMode) {
      setPreviewPosition({ x, y });
    }
  }, [previewMode]);

  // Generate bulk seats at specified position
  const generateBulkSeatsAtPosition = useCallback((config: BulkSeatConfig, x: number, y: number) => {
    const seats: VenueItem[] = [];
    
    // Helper function to convert alphabetical label to index (A=0, B=1, ..., Z=25, AA=26, AB=27, etc.)
    const alphabetToIndex = (label: string): number => {
      let result = 0;
      for (let i = 0; i < label.length; i++) {
        result = result * 26 + (label.charCodeAt(i) - 64); // A=1, B=2, etc.
      }
      return result - 1; // Convert to 0-based index
    };

    // Helper function to convert index to alphabetical label (0=A, 1=B, ..., 25=Z, 26=AA, 27=AB, etc.)
    const indexToAlphabet = (index: number): string => {
      let result = '';
      index++; // Convert to 1-based
      while (index > 0) {
        index--; // Adjust for 0-based calculation
        result = String.fromCharCode(65 + (index % 26)) + result;
        index = Math.floor(index / 26);
      }
      return result;
    };

    // Helper function to get next available row index for auto-detection
    const getNextAvailableRowIndex = (): number => {
      const existingRows = new Set(
        layout.items
          .filter(item => item.type === 'seat' && (item as SeatItem).rowLabel)
          .map(item => (item as SeatItem).rowLabel!)
      );

      // Check for alphabetical rows (A-Z, AA-ZZ, etc.)
      for (let i = 0; i < 1000; i++) { // Check up to reasonable limit
        const rowLabel = indexToAlphabet(i);
        if (!existingRows.has(rowLabel)) {
          return i;
        }
      }
      
      return 0; // Fallback
    };
    
    const generateRowLabel = (rowIndex: number): string => {
      // Use manual starting row if specified, otherwise use auto-detected
      let startingIndex: number;
      if (config.startingRow && config.startingRow.trim() && (config.rowDirection === 'A-Z' || config.rowDirection === 'Z-A')) {
        startingIndex = alphabetToIndex(config.startingRow.trim());
      } else if (config.startingRow && config.startingRow.trim() && (config.rowDirection === '1-N' || config.rowDirection === 'N-1')) {
        startingIndex = parseInt(config.startingRow) - 1;
      } else {
        startingIndex = getNextAvailableRowIndex();
      }
      
      const actualIndex = startingIndex + rowIndex;

      switch (config.rowDirection) {
        case 'A-Z': return indexToAlphabet(actualIndex);
        case 'Z-A': 
          // For Z-A direction with manual starting row
          if (config.startingRow && config.startingRow.trim()) {
            const manualStartIndex = alphabetToIndex(config.startingRow.trim());
            const reverseIndex = manualStartIndex - rowIndex;
            return reverseIndex >= 0 ? indexToAlphabet(reverseIndex) : 'A';
          } else {
            // Default Z-A behavior (Z, Y, X, ...)
            const reverseIndex = Math.max(0, 25 - actualIndex);
            return indexToAlphabet(reverseIndex);
          }
        case '1-N': return (actualIndex + 1).toString();
        case 'N-1': 
          // For N-1 direction with manual starting row
          if (config.startingRow && config.startingRow.trim()) {
            return Math.max(1, parseInt(config.startingRow) - rowIndex).toString();
          } else {
            return Math.max(1, config.rows - rowIndex).toString();
          }
        default: return indexToAlphabet(actualIndex);
      }
    };
    
    const generateSeatNumber = (colIndex: number): number => {
      return config.numberDirection === '1-N' ? colIndex + 1 : config.columns - colIndex;
    };
    
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.columns; col++) {
        const seatX = x + (col * config.columnSpacing) - (config.columns * config.columnSpacing) / 2;
        const seatY = y + (row * config.rowSpacing) - (config.rows * config.rowSpacing) / 2;
        
        const rowLabel = generateRowLabel(row);
        const seatNumber = generateSeatNumber(col);
        
        const seat: VenueItem = {
          id: `seat_${Date.now()}_${row}_${col}_${Math.random().toString(36).substr(2, 4)}`,
          type: 'seat',
          x: Math.max(0, Math.min(layout.canvas.w - config.seatSize, seatX)),
          y: Math.max(0, Math.min(layout.canvas.h - config.seatSize, seatY)),
          w: config.seatSize,
          h: config.seatSize,
          rotation: config.rotation,
          categoryId: config.categoryId,
          rowLabel,
          seatNumber,
          label: `${rowLabel}${seatNumber}`
        } as SeatItem;
        
        seats.push(seat);
      }
    }
    
    return seats;
  }, [layout.canvas]);

  // Category operations
  const addCategory = useCallback((categoryData: Omit<SeatCategory, 'id'>) => {
    dispatch({
      type: 'ADD_CATEGORY',
      payload: {
        id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        ...categoryData
      }
    });
  }, []);

  const updateCategory = useCallback((id: string, data: Partial<SeatCategory>) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: { id, data } });
  }, []);

  const removeCategory = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_CATEGORY', payload: id });
  }, []);

  // Bulk operations
  const handleBulkRotate = useCallback((ids: string[], angle: number) => {
    dispatch({ type: 'SAVE_STATE' });
    dispatch({ type: 'ROTATE_ITEMS', payload: { ids, angle } });
  }, []);

  const handleBulkDelete = useCallback((ids: string[]) => {
    dispatch({ type: 'REMOVE_ITEMS', payload: ids });
    setSelectedItems([]);
  }, []);

  const handleBulkCategoryUpdate = useCallback((ids: string[], categoryId: string) => {
    dispatch({ type: 'SAVE_STATE' });
    dispatch({ type: 'BULK_UPDATE', payload: { ids, data: { categoryId: categoryId } } });
  }, []);

  const handleBulkScale = useCallback((ids: string[], scaleFactor: number) => {
    if (!ids.length) return;
    const selected = layout.items.filter(i => ids.includes(i.id));
    if (!selected.length) return;

    // Compute group centroid using item centers
    const centroid = selected.reduce(
      (acc, i) => {
        acc.x += i.x + i.w / 2;
        acc.y += i.y + i.h / 2;
        return acc;
      },
      { x: 0, y: 0 }
    );
    centroid.x /= selected.length;
    centroid.y /= selected.length;

    // Prepare one-shot updates (avoid pushing many history states)
    const MIN_SIZE = 16;
    const updates = selected.map(i => {
      const centerX = i.x + i.w / 2;
      const centerY = i.y + i.h / 2;

      // Scale position relative to centroid
      const vecX = centerX - centroid.x;
      const vecY = centerY - centroid.y;
      const newCenterX = centroid.x + vecX * scaleFactor;
      const newCenterY = centroid.y + vecY * scaleFactor;

      // Scale size
      const newW = Math.max(MIN_SIZE, i.w * scaleFactor);
      const newH = Math.max(MIN_SIZE, i.h * scaleFactor);

      // Convert back to top-left, clamp to canvas
      let newX = newCenterX - newW / 2;
      let newY = newCenterY - newH / 2;
      newX = Math.max(0, Math.min(layout.canvas.w - newW, newX));
      newY = Math.max(0, Math.min(layout.canvas.h - newH, newY));

      return { id: i.id, data: { x: newX, y: newY, w: newW, h: newH } as Partial<VenueItem> };
    });

    dispatch({ type: 'SAVE_STATE' });
    dispatch({ type: 'UPDATE_ITEMS_NO_HISTORY', payload: updates });
  }, [layout.items, layout.canvas]);

  // Tilt (shear) a selection horizontally so rows slant at a small angle
  const handleBulkTiltX = useCallback((ids: string[], shear: number) => {
    if (ids.length === 0) return;
    const itemsToTilt = layout.items.filter(i => ids.includes(i.id));
    if (itemsToTilt.length === 0) return;

    const centerY = itemsToTilt.reduce((acc, i) => acc + (i.y + i.h / 2), 0) / itemsToTilt.length;
    dispatch({ type: 'SAVE_STATE' });
    const updates = itemsToTilt.map(i => {
      const proposedX = i.x + shear * ((i.y + i.h / 2) - centerY);
      const newX = Math.max(0, Math.min(layout.canvas.w - i.w, proposedX));
      return { id: i.id, data: { x: newX } };
    });
    dispatch({ type: 'UPDATE_ITEMS_NO_HISTORY', payload: updates });
  }, [layout.items, layout.canvas]);

  const handleBulkSeatsCreate = useCallback((seats: SeatItem[]) => {
    dispatch({ type: 'ADD_ITEMS', payload: seats });
  }, []);

  // Curve arrangement handler
  const handleCurveArrangement = useCallback((ids: string[], config: CurveConfig) => {
    dispatch({ type: 'SAVE_STATE' });
    dispatch({ type: 'ARRANGE_IN_CURVE', payload: { ids, config } });
  }, []);

  // Seat editing functions
  const validateSeatNumber = useCallback((seatNumber: string, rowLabel: string, excludeId?: string): boolean => {
    if (!seatNumber || !rowLabel) return true; // Allow empty for now
    
    const fullSeatLabel = `${rowLabel}${seatNumber}`;
    return !layout.items.some(item => 
      item.id !== excludeId && 
      item.type === 'seat' && 
      (item as SeatItem).rowLabel === rowLabel && 
      (item as SeatItem).seatNumber?.toString() === seatNumber
    );
  }, [layout.items]);

  // Enhanced function to get next available row letter
  const getNextAvailableRow = useCallback((): string => {
    const existingRows = new Set(
      layout.items
        .filter(item => item.type === 'seat' && (item as SeatItem).rowLabel)
        .map(item => (item as SeatItem).rowLabel!)
    );

    // Generate row letters A-Z
    for (let i = 0; i < 26; i++) {
      const rowLetter = String.fromCharCode(65 + i); // A=65, B=66, etc.
      if (!existingRows.has(rowLetter)) {
        return rowLetter;
      }
    }
    
    // If all A-Z are used, start with AA, AB, etc.
    for (let i = 0; i < 26; i++) {
      for (let j = 0; j < 26; j++) {
        const rowLetter = String.fromCharCode(65 + i) + String.fromCharCode(65 + j);
        if (!existingRows.has(rowLetter)) {
          return rowLetter;
        }
      }
    }
    
    return 'A'; // Fallback
  }, [layout.items]);

  const generateUniqueSeatNumber = useCallback((rowLabel: string): string => {
    const existingNumbers = layout.items
      .filter(item => item.type === 'seat' && (item as SeatItem).rowLabel === rowLabel)
      .map(item => (item as SeatItem).seatNumber || 0)
      .filter(num => num > 0)
      .sort((a, b) => a - b);

    let nextNumber = 1;
    for (const num of existingNumbers) {
      if (num === nextNumber) {
        nextNumber++;
      } else {
        break;
      }
    }
    return nextNumber.toString();
  }, [layout.items]);

  // Get optimal seat position (next row + seat 1, or next seat in current row)
  const getOptimalSeatPosition = useCallback((): { rowLabel: string; seatNumber: string } => {
    const existingSeats = layout.items.filter(item => item.type === 'seat') as SeatItem[];
    
    if (existingSeats.length === 0) {
      return { rowLabel: 'A', seatNumber: '1' };
    }

    // Get existing rows and find next available row letter inline
    const existingRows = new Set(
      existingSeats
        .filter(seat => seat.rowLabel)
        .map(seat => seat.rowLabel!)
    );

    // Find next available row letter
    let nextAvailableRow = 'A';
    for (let i = 0; i < 26; i++) {
      const rowLetter = String.fromCharCode(65 + i);
      if (!existingRows.has(rowLetter)) {
        nextAvailableRow = rowLetter;
        break;
      }
    }

    // Get all existing rows and their seat data
    const rowData = existingSeats.reduce((acc, seat) => {
      const row = seat.rowLabel || 'A';
      const seatNum = seat.seatNumber || 1;
      
      if (!acc[row]) {
        acc[row] = { maxSeat: seatNum, seatCount: 1, seats: [seatNum] };
      } else {
        acc[row].maxSeat = Math.max(acc[row].maxSeat, seatNum);
        acc[row].seatCount++;
        acc[row].seats.push(seatNum);
      }
      
      return acc;
    }, {} as Record<string, { maxSeat: number; seatCount: number; seats: number[] }>);

    // Sort rows alphabetically to find the pattern
    const sortedRows = Object.keys(rowData).sort();
    if (sortedRows.length === 0) {
      return { rowLabel: 'A', seatNumber: '1' };
    }

    const lastRow = sortedRows[sortedRows.length - 1];
    const lastRowData = rowData[lastRow];

    // If last row has less than 10 seats, continue in that row
    if (lastRowData.seatCount < 10) {
      // Find next seat number in this row (inline logic to avoid circular dependency)
      const existingNumbers = lastRowData.seats.sort((a, b) => a - b);
      let nextNumber = 1;
      for (const num of existingNumbers) {
        if (num === nextNumber) {
          nextNumber++;
        } else {
          break;
        }
      }
      return { rowLabel: lastRow, seatNumber: nextNumber.toString() };
    }

    // Otherwise, start a new row
    return { rowLabel: nextAvailableRow, seatNumber: '1' };
  }, [layout.items]);

  const handleSeatDoubleClick = useCallback((seatId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const seat = layout.items.find(item => item.id === seatId) as SeatItem;
    if (seat && seat.type === 'seat') {
      setEditingSeatId(seatId);
      
      // Generate unique seat number inline to avoid circular dependency
      const defaultSeatNumber = seat.seatNumber?.toString() || (() => {
        const rowLabel = seat.rowLabel || 'A';
        const existingNumbers = layout.items
          .filter(item => item.type === 'seat' && (item as SeatItem).rowLabel === rowLabel)
          .map(item => (item as SeatItem).seatNumber || 0)
          .filter(num => num > 0)
          .sort((a, b) => a - b);

        let nextNumber = 1;
        for (const num of existingNumbers) {
          if (num === nextNumber) {
            nextNumber++;
          } else {
            break;
          }
        }
        return nextNumber.toString();
      })();
      
      setEditingSeatNumber(defaultSeatNumber);
      setEditingRowLabel(seat.rowLabel || 'A');
    }
  }, [layout.items]);

  const handleSeatNumberSave = useCallback(() => {
    if (!editingSeatId) return;
    
    const seatNumber = editingSeatNumber.trim();
    const rowLabel = editingRowLabel.trim().toUpperCase();
    
    if (!validateSeatNumber(seatNumber, rowLabel, editingSeatId)) {
      alert(`Seat ${rowLabel}${seatNumber} already exists! Please choose a different number.`);
      return;
    }

    dispatch({ type: 'SAVE_STATE' });
    dispatch({ 
      type: 'UPDATE_ITEM', 
      payload: { 
        id: editingSeatId, 
        data: { 
          seatNumber: parseInt(seatNumber) || 1,
          rowLabel: rowLabel,
          label: `${rowLabel}${seatNumber}`
        } 
      } 
    });
    
    setEditingSeatId(null);
    setEditingSeatNumber('');
    setEditingRowLabel('');
  }, [editingSeatId, editingSeatNumber, editingRowLabel, validateSeatNumber]);

  const handleSeatNumberCancel = useCallback(() => {
    setEditingSeatId(null);
    setEditingSeatNumber('');
    setEditingRowLabel('');
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, MIN_ZOOM));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
  }, []);

  // Layout operations
  const saveLayout = useCallback(async () => {
    if (!layout.name?.trim()) {
      alert('Please provide a layout name.');
      return;
    }
    if (!selectedOwnerId) {
      // If we have an initial venue provider, we must have a selected owner
      if (initialVenueProvider) {
        alert('Error: Venue owner association is missing. Please go back and try again.');
        return;
      }
      // In standalone mode, ask for confirmation
      if (!confirm('No venue owner selected. Save layout without association?')) return;
    }
    // Map internal items to API legacy SeatMapItem format
    const apiItems: ApiSeatMapItem[] = layout.items.map((it) => ({
      id: it.id,
      type: it.type as any,
      x: it.x,
      y: it.y,
      w: it.w,
      h: it.h,
      rotation: it.rotation || 0,
      categoryId: (it as any).categoryId,
      label: (it as any).label,
      // Persist table shape from metadata if present
      shape: (it as any).metadata?.shape ?? (it as any).shape,
      rowLabel: (it as any).rowLabel,
      seatNumber: (it as any).seatNumber,
      // Preserve table/booth grouping for seats
      tableId: (it as any).metadata?.tableId,
      seatCount: (it as any).metadata?.seatCount,
      tableSeats: (it as any).metadata?.seatCount,
    }));
    // Debug: log table/booth info being sent
    console.debug('Saving layout items (tables/booths):', apiItems.filter(i=>i.type==='table'||i.type==='booth').map(t=>({id:t.id, type:t.type, shape:t.shape, categoryId:t.categoryId})));    try {
      console.log('Saving layout with venueOwnerId:', selectedOwnerId);
      const payload = {
        name: layout.name,
        venueOwnerId: selectedOwnerId || undefined,
        items: apiItems as any,
        categories: layout.categories.map(c => ({ id: c.id, name: c.name, color: c.color, price: c.price })),
        canvasW: layout.canvas.w,
        canvasH: layout.canvas.h,
        ownerCanEdit: allowOwnerEdit,
      } as any;

      let saved: ApiVenueLayout;
      if (layout.id) {
        // Update existing layout (no new record)
        saved = await venueLayoutService.updateLayout(layout.id, payload);
      } else {
        // Create new layout
        saved = await venueLayoutService.createLayout(payload);
      }

      dispatch({ type: 'SET_LAYOUT', payload: {
        id: saved._id,
        name: saved.name,
        items: saved.items as any,
        categories: saved.categories as any,
        canvas: { w: saved.canvasW, h: saved.canvasH },
        meta: { created: saved.createdAt, updated: saved.updatedAt, version: layout.meta?.version ?? 1 },
      }});

      // Refresh provider layouts list after save
      if (selectedOwnerId) {
        venueLayoutService.getAllLayouts({ venueOwnerId: selectedOwnerId }).then(setProviderLayouts).catch(() => {});
        setSelectedLayoutId(saved._id);
      }

      alert(`Layout ${layout.id ? 'updated' : 'created'} successfully${selectedOwnerId ? ' and associated with venue owner' : ''}.\nLayout ID: ${saved._id}`);
    } catch (e: any) {
      alert(e?.message || 'Failed to save layout');
    }
  }, [layout, selectedOwnerId, allowOwnerEdit]);

  const exportLayout = useCallback(() => {
    // Single export: readable AND compact (v2 schema + pretty-printed)
    // Uses short keys and codes for storage efficiency, and indentation for readability
    const compact = toCompactLayoutV2(layout);
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(compact, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', (layout.name || 'venue-layout') + '.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, [layout]);

  // Load an existing layout by id for editing
  const loadLayoutById = useCallback(async (id: string) => {
    try {
      const data = await venueLayoutService.getLayoutById(id);
      // Normalize items: move shape into metadata for tables
      let normalizedItems = (data.items || []).map((it: any) => {
        if (it.type === 'table') {
          return {
            ...it,
            metadata: {
              ...(it.metadata || {}),
              shape: it.shape || it.metadata?.shape,
              seatCount: it.tableSeats ?? it.metadata?.seatCount,
            }
          };
        }
        return it;
      });

      // Ensure table/booth categories exist and assign missing categoryId
      let updatedCategories = [...(data.categories || [])] as any[];
      const getOrCreateScopedCategory = (type: 'table' | 'booth', samplePrice?: number) => {
        let cat = updatedCategories.find(c => c.appliesTo === type);
        if (!cat) {
          cat = {
            id: `${type}_cat_${Math.random().toString(36).slice(2, 8)}`,
            name: type === 'table' ? 'Tables' : 'Booths',
            color: type === 'table' ? '#8b5cf6' : '#10b981',
            price: typeof samplePrice === 'number' && samplePrice > 0 ? samplePrice : 0,
            appliesTo: type,
          };
          updatedCategories.push(cat);
        }
        return cat.id;
      };

      // Reassign missing or mismatched categories for non-seat items
      const needsFix = (i:any) => (i.type === 'table' || i.type === 'booth') && (
        !i.categoryId || (() => {
          const cat = updatedCategories.find(c => c.id === i.categoryId) as any;
          const scope = cat?.appliesTo ?? 'seat';
          return scope !== i.type;
        })()
      );

      if (normalizedItems.some(needsFix)) {
        normalizedItems = normalizedItems.map((i:any) => {
          if (needsFix(i)) {
            const price = i.metadata?.price;
            const catId = getOrCreateScopedCategory(i.type, price);
            console.debug('Retrofit category assignment', { itemId: i.id, type: i.type, previousCategoryId: i.categoryId, newCategoryId: catId });
            return { ...i, categoryId: catId };
          }
          return i;
        });
      }
      console.debug('Loaded layout items (normalized):', normalizedItems.filter((i:any)=>i.type==='table'||i.type==='booth').map((t:any)=>({id:t.id, type:t.type, categoryId:t.categoryId, shape:t.metadata?.shape, rawShape:t.shape})));
      dispatch({ type: 'SET_LAYOUT', payload: {
        id: data._id,
        name: data.name,
        items: normalizedItems as any,
        categories: updatedCategories as any,
        canvas: { w: data.canvasW, h: data.canvasH },
        meta: { created: data.createdAt, updated: data.updatedAt, version: 1 },
      }});
      setSelectedLayoutId(id);
    } catch (e: any) {
      alert(e?.message || 'Failed to load layout');
    }
  }, []);

  // Start a fresh layout for the selected provider
  const startNewLayout = useCallback(() => {
    dispatch({ type: 'SET_LAYOUT', payload: {
      id: undefined,
      name: 'Untitled Layout',
      items: [],
      categories: [],
      canvas: { w: 1200, h: 700 },
      meta: {},
    } as any });
    setSelectedLayoutId(null);
  }, []);

  const importLayout = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedRaw = JSON.parse(e.target?.result as string);
        let normalized: VenueLayout;
        if (importedRaw && importedRaw.v === 2) {
          // Compact v2 import
          normalized = fromCompactLayoutV2(importedRaw);
        } else {
          // Legacy verbose import
          normalized = {
            id: importedRaw.id,
            name: importedRaw.name || 'Imported Layout',
            items: Array.isArray(importedRaw.items) ? importedRaw.items : [],
            categories: Array.isArray(importedRaw.categories) ? importedRaw.categories : [],
            canvas: importedRaw.canvas || { w: 1200, h: 800 },
            meta: importedRaw.meta
          };
        }

        dispatch({ type: 'SET_LAYOUT', payload: normalized });
        setSelectedItems([]);
        alert('Layout imported successfully!');
      } catch (error) {
        alert('Error importing layout. Please check the file format.');
      }
    };
    reader.readAsText(file);
  }, []);

  const TYPE_TO_CODE: Record<string, number> = useMemo(() => ({
    seat: 0,
    table: 1,
    booth: 2,
    entry: 3,
    exit: 4,
    washroom: 5,
    screen: 6,
    stage: 7,
  }), []);
  const CODE_TO_TYPE: Record<number, VenueItem['type']> = useMemo(() => ({
    0: 'seat', 1: 'table', 2: 'booth', 3: 'entry', 4: 'exit', 5: 'washroom', 6: 'screen', 7: 'stage'
  }), []);
  const SHAPE_TO_CODE: Record<string, number> = useMemo(() => ({ round: 0, square: 1, rectangle: 2, triangle: 3, 'semi-circle': 4 }), []);
  const CODE_TO_SHAPE: Record<number, string> = useMemo(() => ({ 0: 'round', 1: 'square', 2: 'rectangle', 3: 'triangle', 4: 'semi-circle' }), []);

  type CompactCategory = { i: string; n: string; k: string; p: number };
  type CompactItem = {
    i: string; // id
    t: number; // type code
    tp?: string; // human-readable type (seat/table/booth/screen...)
    pp?: number; // derived price for readability (seat from category, table/booth from metadata)
    x: number; y: number; w: number; h: number;
    r?: number; // rotation
    c?: string; // category id
    rl?: string; // row label
    sn?: number; // seat number
    l?: string; // label
    m?: Record<string, any>; // metadata compacted
  };
  type CompactLayoutV2 = {
    v: 2;
    n: string; // name
    c: [number, number]; // canvas [w,h]
    cats: CompactCategory[];
    items: CompactItem[];
    id?: string;
    meta?: VenueLayout['meta'];
  };

  const toCompactLayoutV2 = (full: VenueLayout): CompactLayoutV2 => {
    const cats: CompactCategory[] = full.categories.map(c => ({ i: c.id, n: c.name, k: c.color, p: c.price }));
    const catPriceById: Record<string, number> = Object.fromEntries(full.categories.map(c => [c.id, c.price]));
    const items: CompactItem[] = full.items.map(it => {
      const base: CompactItem = {
        i: it.id,
        t: TYPE_TO_CODE[it.type] ?? 99,
        tp: it.type,
        x: it.x, y: it.y, w: it.w, h: it.h,
      };
      if (it.rotation && it.rotation !== 0) base.r = it.rotation;
      if ('categoryId' in it && (it as any).categoryId) base.c = (it as any).categoryId;
      if ('label' in it && (it as any).label) base.l = (it as any).label as string;

      if (it.type === 'seat') {
        const s = it as SeatItem;
        if (s.rowLabel) base.rl = s.rowLabel;
        if (typeof s.seatNumber === 'number') base.sn = s.seatNumber;
        // Seats attached to table: store tableId in metadata (tid)
        const tid = s.metadata?.tableId;
        const gid = s.metadata?.groupId;
        if (tid || gid) base.m = { ...(tid ? { tid } : {}), ...(gid ? { gid } : {}) };
        // Derived seat price from category
        if (base.c && typeof catPriceById[base.c] === 'number') base.pp = catPriceById[base.c];
      } else {
        const n = it as NonSeatItem;
        const m: Record<string, any> = {};
        if (n.type === 'table') {
          if (n.metadata?.shape) m.sh = SHAPE_TO_CODE[n.metadata.shape] ?? undefined;
          if (typeof n.metadata?.seatCount === 'number') m.sc = n.metadata.seatCount;
          if (typeof n.metadata?.price === 'number') m.p = n.metadata.price;
          if (n.metadata?.groupId) m.gid = n.metadata.groupId;
          if (typeof n.metadata?.price === 'number') base.pp = n.metadata.price;
        } else if (n.type === 'booth') {
          if (typeof n.metadata?.price === 'number') m.p = n.metadata.price;
          if (typeof n.metadata?.price === 'number') base.pp = n.metadata.price;
        }
        if (Object.keys(m).length) base.m = m;
      }
      return base;
    });

    return {
      v: 2,
      id: full.id,
      n: full.name,
      c: [full.canvas.w, full.canvas.h],
      cats,
      items,
      meta: full.meta,
    };
  };

  const fromCompactLayoutV2 = (compact: CompactLayoutV2): VenueLayout => {
    const categories: SeatCategory[] = (compact.cats || []).map((c: any) => ({ id: c.i, name: c.n, color: c.k, price: c.p }));
    const items: VenueItem[] = (compact.items || []).map((ci: any) => {
      const type = CODE_TO_TYPE[ci.t] || 'seat';
      const base: any = {
        id: ci.i, type,
        x: ci.x, y: ci.y, w: ci.w, h: ci.h,
        rotation: ci.r || 0,
      };
      if (ci.c) base.categoryId = ci.c;
      if (ci.l) base.label = ci.l;

      if (type === 'seat') {
        base.rowLabel = ci.rl;
        base.seatNumber = ci.sn;
        if (ci.m) {
          base.metadata = {
            ...(ci.m.tid ? { tableId: ci.m.tid } : {}),
            ...(ci.m.gid ? { groupId: ci.m.gid } : {}),
          };
        }
      } else if (type === 'table') {
        const m = ci.m || {};
        base.metadata = {
          ...(m.sh !== undefined ? { shape: CODE_TO_SHAPE[m.sh] } : {}),
          ...(m.sc !== undefined ? { seatCount: m.sc } : {}),
          ...(m.gid ? { groupId: m.gid } : {}),
          ...(m.p !== undefined ? { price: m.p } : {}),
        };
      } else if (type === 'booth') {
        const m = ci.m || {};
        base.metadata = {
          ...(m.p !== undefined ? { price: m.p } : {}),
        };
      }
      return base as VenueItem;
    });

    return {
      id: compact.id,
      name: compact.n || 'Imported Layout',
      items,
      categories,
      canvas: { w: compact.c?.[0] || 1200, h: compact.c?.[1] || 800 },
      meta: compact.meta,
    };
  };

  const selectedItemsRef = useRef<string[]>(selectedItems);
  const layoutItemsRef = useRef<VenueItem[]>(layout.items);
  const editingSeatIdRef = useRef<string | null>(editingSeatId);
  const handleBulkDeleteRef = useRef(handleBulkDelete);
  const handleBulkRotateRef = useRef(handleBulkRotate);
  const handleBulkTiltXRef = useRef(handleBulkTiltX);
  const handleSeatDoubleClickRef = useRef(handleSeatDoubleClick);

  useEffect(() => { selectedItemsRef.current = selectedItems; }, [selectedItems]);
  useEffect(() => { layoutItemsRef.current = layout.items; }, [layout.items]);
  useEffect(() => { editingSeatIdRef.current = editingSeatId; }, [editingSeatId]);
  useEffect(() => { handleBulkDeleteRef.current = handleBulkDelete; }, [handleBulkDelete]);
  useEffect(() => { handleBulkRotateRef.current = handleBulkRotate; }, [handleBulkRotate]);
  useEffect(() => { handleBulkTiltXRef.current = handleBulkTiltX; }, [handleBulkTiltX]);
  useEffect(() => { handleSeatDoubleClickRef.current = handleSeatDoubleClick; }, [handleSeatDoubleClick]);

  // Keyboard shortcuts (stable deps, using refs for latest values)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if editing a seat number or typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || editingSeatIdRef.current) return;

      const selected = selectedItemsRef.current;
      const items = layoutItemsRef.current;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
        setSelectedItems([]);
        return;
      }
      if (((e.ctrlKey || e.metaKey) && e.key === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z')) {
        e.preventDefault();
        dispatch({ type: 'REDO' });
        setSelectedItems([]);
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selected.length > 0) {
          handleBulkDeleteRef.current(selected);
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setSelectedItems(items.map(item => item.id));
        return;
      }
      if (e.key === 'F2' && selected.length === 1) {
        e.preventDefault();
        const selectedItem = items.find(item => item.id === selected[0]);
        if (selectedItem && selectedItem.type === 'seat') {
          const mockEvent = { stopPropagation: () => {} } as unknown as React.MouseEvent;
          handleSeatDoubleClickRef.current(selectedItem.id, mockEvent);
        }
        return;
      }
      if (selected.length > 0 && (e.key === '[' || e.key === ']')) {
        e.preventDefault();
        const angle = e.key === ']' ? 5 : -5;
        handleBulkRotateRef.current(selected, angle);
        return;
      }
      if (selected.length > 0 && e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const shear = e.key === 'ArrowRight' ? 0.2 : -0.2;
        handleBulkTiltXRef.current(selected, shear);
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const seatCount = layout.items.filter(item => item.type === 'seat').length;
  const canUndo = layout.historyIndex > 0;
  const canRedo = layout.historyIndex < layout.history.length - 1;

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden w-full max-w-full">
      {/* Back button */}
      {onBack && (
        <div className="fixed top-2 left-2 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="gap-1 px-2 py-1 text-xs bg-white shadow-lg"
          >
            ← Back to Layouts
          </Button>
        </div>
      )}
      
      {/* Mode Toggle */}
      {showModeToggle && (
        <div className="fixed top-2 right-2 z-50 bg-white border rounded-lg p-1 shadow-lg">
          <div className="flex">
            <Button
              variant={mode === 'admin' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('admin')}
              className="px-2 py-1 text-xs"
            >
              Admin
            </Button>
            <Button
              variant={mode === 'user' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('user')}
              className="px-2 py-1 text-xs"
            >
              User
            </Button>
          </div>
        </div>
      )}

      {mode === 'admin' ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-2 border-b bg-white min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Input
                value={layout.name}
                onChange={(e) => {
                  dispatch({ type: 'SET_NAME', payload: e.target.value });
                }}
                className="text-sm font-semibold bg-transparent border-none p-0 h-auto max-w-48 min-w-0"
                placeholder="Venue Layout Name"
              />
              <Badge variant="secondary" className="text-xs px-2 py-1 whitespace-nowrap">{seatCount} seats</Badge>
              {/* Only show venue owner selection if no initial provider is set and not in owner editing mode */}
              {!initialVenueProvider && !isOwnerEditing && (
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-xs text-gray-500">Associate Owner:</span>
                  <Select value={selectedOwnerId} onValueChange={setSelectedOwnerId}>
                    <SelectTrigger size="sm" className="min-w-56">
                      <SelectValue placeholder="Select a venue owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {owners.filter(o => o.profile && o.profile._id).map((o) => (
                        <SelectItem key={o._id} value={o.profile!._id!}>
                          {o.firstName} {o.lastName} — {o.email}
                        </SelectItem>
                      ))}
                      {owners.filter(o => o.profile && o.profile._id).length === 0 && (
                        <SelectItem value="__noowners__" disabled>
                          No venue owners with profiles found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {/* Show selected venue provider info when initial provider is set */}
              {initialVenueProvider && (
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-xs text-gray-500">Venue Owner:</span>
                  <Badge variant="outline" className="text-xs">
                    {initialVenueProvider.firstName} {initialVenueProvider.lastName}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button onClick={saveLayout} size="sm" className="gap-1 px-2 py-1 text-xs">
                <Save className="h-3 w-3" />
                Save
              </Button>
              <Button onClick={exportLayout} variant="outline" size="sm" className="gap-1 px-2 py-1 text-xs">
                <Download className="h-3 w-3" />
                Export
              </Button>
              
              <Button variant="outline" size="sm" className="gap-1 px-2 py-1 text-xs" asChild>
                <label>
                  <Upload className="h-3 w-3" />
                  Import
                  <input type="file" accept=".json" onChange={importLayout} className="hidden" />
                </label>
              </Button>

              {/* Admin toggle to allow venue owner edits */}
              {!isOwnerEditing && (
                <label className="ml-2 inline-flex items-center gap-1 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    className="accent-blue-600"
                    checked={allowOwnerEdit}
                    onChange={(e) => setAllowOwnerEdit(e.target.checked)}
                  />
                  Allow owner to edit
                </label>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between p-2 bg-gray-50 border-b min-w-0">
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="px-1 py-1 lg:hidden"
                title="Toggle Sidebar"
              >
                <Menu className="h-3 w-3" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
                className={`gap-1 px-2 py-1 text-xs ${showGrid ? 'bg-blue-50' : ''}`}
              >
                <Grid className="h-3 w-3" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkCreator(true)}
                className="gap-1 px-2 py-1 text-xs"
                disabled={layout.categories.length === 0}
                title={layout.categories.length === 0 ? "Create a category first" : "Create multiple seats at once"}
              >
                <Target className="h-3 w-3" />
                <span className="hidden sm:inline">Bulk Seats</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTableCreator(true)}
                className="gap-1 px-2 py-1 text-xs"
                title="Create table with seats"
              >
                <Square className="h-3 w-3" />
                <span className="hidden sm:inline">Create Table</span>
              </Button>

              {pendingTableData && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded text-xs border">
                  <span className="text-blue-700">Click to place {pendingTableData.shape} table</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPendingTableData(null);
                      setSelectedTool('select');
                    }}
                    className="h-4 w-4 p-0 text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {pendingBulkSeats && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded text-xs border">
                  <span className="text-green-700">Click to place {pendingBulkSeats.rows}×{pendingBulkSeats.columns} seats</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPendingBulkSeats(null);
                      setSelectedTool('select');
                    }}
                    className="h-4 w-4 p-0 text-green-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-1 border-l pl-1 ml-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch({ type: 'UNDO' })}
                  disabled={!canUndo}
                  title="Undo (Ctrl+Z)"
                  className="px-1 py-1"
                >
                  <RefreshCw className="h-3 w-3 rotate-180" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch({ type: 'REDO' })}
                  disabled={!canRedo}
                  title="Redo (Ctrl+Y)"
                  className="px-1 py-1"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= MIN_ZOOM}
                  className="px-1 py-1"
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <span className="text-xs font-medium min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= MAX_ZOOM}
                  className="px-1 py-1"
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomReset}
                  className="px-1 py-1"
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 min-h-0 overflow-hidden min-w-0">
            {/* Left Sidebar */}
            <div className={`${sidebarOpen ? 'w-56 lg:w-64' : 'w-0'} transition-all duration-300 border-r bg-white overflow-hidden flex-shrink-0`}>
              <div className="p-2 overflow-y-auto space-y-2 h-full">
                {/* Provider layouts list - only show when no initial provider (standalone mode) */}
                {!initialVenueProvider && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">Provider Layouts</span>
                      <Button size="sm" variant="outline" className="h-6 px-2 py-0 text-xs" onClick={startNewLayout} disabled={!selectedOwnerId}>
                        New
                      </Button>
                    </div>
                    {!selectedOwnerId && (
                      <div className="text-xs text-gray-500">Select a venue owner to view their layouts.</div>
                    )}
                    {selectedOwnerId && isLoadingLayouts && (
                      <div className="text-xs text-gray-500">Loading layouts…</div>
                    )}
                    {selectedOwnerId && !isLoadingLayouts && providerLayouts.length === 0 && (
                      <div className="text-xs text-gray-500">No layouts yet. Click New to create one.</div>
                    )}
                    <div className="space-y-1">
                      {providerLayouts.map(l => (
                        <Button
                          key={l._id}
                          size="sm"
                          variant={selectedLayoutId === l._id ? 'default' : 'ghost'}
                          className="w-full justify-start h-7 text-xs"
                          onClick={() => loadLayoutById(l._id)}
                          title={l.name}
                        >
                          <span className="truncate">{l.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <ToolPalette
                  selectedTool={selectedTool}
                  onToolSelect={setSelectedTool}
                  selectedCategoryId={selectedCategoryId}
                  onRequestCreateTable={() => setShowTableCreator(true)}
                />
                
                <CategoryManager
                  categories={layout.categories}
                  onAdd={addCategory}
                  onUpdate={updateCategory}
                  onRemove={removeCategory}
                  selectedId={selectedCategoryId}
                  onSelect={setSelectedCategoryId}
                />

                <PriceOverviewPanel
                  items={layout.items as any}
                  categories={layout.categories}
                />
                
                <SeatOverviewPanel
                  items={layout.items}
                  categories={layout.categories}
                />

                {/* Single item details for seats, booths, and tables */}
                <SelectedItemDetailsPanel
                  selectedIds={selectedItems}
                  items={layout.items as any}
                  categories={layout.categories}
                  onUpdateItem={(id, data) => dispatch({ type: 'UPDATE_ITEM', payload: { id, data: data as any } })}
                />
                
                <BulkOperationsPanel
                  selectedItems={selectedItems}
                  layout={layout}
                  onRotate={handleBulkRotate}
                  onScale={handleBulkScale}
                  onDelete={handleBulkDelete}
                  onUpdateCategory={handleBulkCategoryUpdate}
                  onClearSelection={() => setSelectedItems([])}
                  onShowCurvePanel={() => setShowCurvePanel(true)}
                />
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 p-2 overflow-hidden min-w-0">
              <SeatMapRenderer
                layout={layout}
                selectedItems={selectedItems}
                onItemClick={handleItemClick}
                onItemsMove={handleItemsMove}
                onCanvasClick={handleCanvasClick}
                onSelectionBoxDrag={handleSelectionBoxDrag}
                onDragEnd={handleDragEnd}
                onMouseMove={handleMouseMoveForPreview}
                onSeatDoubleClick={handleSeatDoubleClick}
                zoom={zoom}
                showGrid={showGrid}
                mode={mode}
                bookedSeats={[]}
                selectedTool={selectedTool}
                pendingTableData={pendingTableData}
                pendingBulkSeats={pendingBulkSeats}
                previewMode={previewMode}
                previewData={previewData}
                previewPosition={previewPosition}
              />
            </div>
          </div>

          {/* Bulk Seat Creator Modal */}
          <BulkSeatCreator
            isOpen={showBulkCreator}
            onClose={() => setShowBulkCreator(false)}
            onCreateSeats={handleBulkSeatsCreate}
            onStartPlacement={handleStartBulkSeatPlacement}
            categories={layout.categories}
            canvasSize={layout.canvas}
            existingItems={layout.items}
          />
          
          {/* Table Creator Modal */}
          <TableCreator
            isOpen={showTableCreator}
            onClose={() => setShowTableCreator(false)}
            onCreateTable={(tableData) => {
              // Calculate center position for table placement
              const centerX = layout.canvas.w / 2;
              const centerY = layout.canvas.h / 2;
              handleCreateTable(tableData, centerX, centerY);
            }}
            onStartPlacement={handleStartTablePlacement}
            onStartPreview={handleStartPreview}
            onUpdatePreview={handleUpdatePreview}
            onCancelPreview={handleCancelPreview}
            onConfirmPreview={handleConfirmPreview}
            categories={layout.categories}
          />

          {/* Curve Arrangement Panel Modal */}
          {showCurvePanel && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <CurveArrangementPanel
                  selectedItems={selectedItems}
                  items={layout.items}
                  canvasSize={layout.canvas}
                  onArrangeCurve={handleCurveArrangement}
                  onClose={() => setShowCurvePanel(false)}
                />
              </div>
            </div>
          )}

          {/* Seat Number Editor Modal */}
          {editingSeatId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Edit Seat Number</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Row Label</label>
                    <Input
                      value={editingRowLabel}
                      onChange={(e) => setEditingRowLabel(e.target.value.toUpperCase())}
                      placeholder="A"
                      className="w-full"
                      maxLength={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && editingRowLabel && editingSeatNumber && validateSeatNumber(editingSeatNumber, editingRowLabel, editingSeatId)) {
                          handleSeatNumberSave();
                        } else if (e.key === 'Escape') {
                          handleSeatNumberCancel();
                        }
                      }}
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Seat Number</label>
                    <Input
                      value={editingSeatNumber}
                      onChange={(e) => setEditingSeatNumber(e.target.value)}
                      placeholder="1"
                      type="number"
                      min="1"
                      className="w-full"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && editingRowLabel && editingSeatNumber && validateSeatNumber(editingSeatNumber, editingRowLabel, editingSeatId)) {
                          handleSeatNumberSave();
                        } else if (e.key === 'Escape') {
                          handleSeatNumberCancel();
                        }
                      }}
                    />
                  </div>

                  {editingRowLabel && editingSeatNumber && (
                    <div className="p-2 bg-blue-50 rounded text-sm">
                      <strong>Preview:</strong> {editingRowLabel}{editingSeatNumber}
                      {!validateSeatNumber(editingSeatNumber, editingRowLabel, editingSeatId) && (
                        <div className="text-red-600 mt-1">
                          ⚠️ This seat number already exists!
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSeatNumberSave}
                      className="flex-1"
                      disabled={!editingRowLabel || !editingSeatNumber || !validateSeatNumber(editingSeatNumber, editingRowLabel, editingSeatId)}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSeatNumberCancel}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-2 border-b bg-white">
            <h1 className="text-lg font-bold">{layout.name}</h1>
            <p className="text-xs text-gray-600">Select your seats</p>
          </div>
          <div className="flex-1 overflow-hidden">
            <SeatMapRenderer
              layout={layout}
              selectedItems={selectedItems}
              onItemClick={handleItemClick}
              onItemsMove={() => {}}
              onCanvasClick={() => {}}
              onSelectionBoxDrag={() => {}}
              onDragEnd={() => {}}
              onMouseMove={handleMouseMoveForPreview}
              onSeatDoubleClick={handleSeatDoubleClick}
              zoom={zoom}
              showGrid={false}
              mode={mode}
              bookedSeats={[]}
              pendingTableData={null}
              pendingBulkSeats={null}
              previewMode={previewMode}
              previewData={previewData}
              previewPosition={previewPosition}
            />
          </div>
          {selectedItems.length > 0 && (
            <div className="p-2 bg-white border-t">
              <p className="text-xs font-medium">
                Selected seats: {selectedItems.length}
              </p>
              <Button className="mt-1 text-xs px-2 py-1" size="sm">Book Selected Seats</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DynamicVenueSystem;