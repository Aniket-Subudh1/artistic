"use client";
import React, { useState, useCallback, useMemo, useReducer, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import BulkSeatCreator from './BulkSeatCreator';
import CategoryManager from './CategoryManager';
import BulkOperationsPanel from './BulkOperationsPanel';
import TableCreator, { TableCreationData } from './TableCreator';
import CurveArrangementPanel from './CurveArrangementPanel';
import SeatOverviewPanel from './SeatOverviewPanel';

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
const MAX_ITEMS_PER_FRAME = 1000; // Increased for better UX
const SEAT_SIZE = 24;
const MIN_ZOOM = 0.1; // Allow more zoom out for large venues
const MAX_ZOOM = 5;   // Allow more zoom in for precision
const VIEWPORT_UPDATE_DEBOUNCE = 50; // ms
const RENDER_CHUNK_SIZE = 200; // Items to render per chunk

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
    const svgPoint = element.createSVGPoint();
    
    // Get the current viewport in SVG coordinates
    svgPoint.x = 0;
    svgPoint.y = 0;
    const topLeft = svgPoint.matrixTransform(element.getScreenCTM()?.inverse());
    
    svgPoint.x = rect.width;
    svgPoint.y = rect.height;
    const bottomRight = svgPoint.matrixTransform(element.getScreenCTM()?.inverse());
    
    setViewportBounds({
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y,
    });
  }, []);

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
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    return {
      x: (clientX - rect.left) / zoom,
      y: (clientY - rect.top) / zoom
    };
  }, [zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent, itemId?: string) => {
    e.preventDefault();
    const { x, y } = getSVGCoordinates(e.clientX, e.clientY);
    
    if (itemId && mode === 'admin' && selectedTool === 'select') {
      // Item selection and drag
      const multiSelect = e.ctrlKey || e.metaKey;
      onItemClick(itemId, multiSelect);
      
      if (selectedItems.includes(itemId) || multiSelect) {
        setDragStart({ x, y });
        setIsDragging(true);
      }
    } else if (!itemId && selectedTool === 'select') {
      // Selection box drag
      setSelectionBox({ startX: x, startY: y, endX: x, endY: y });
      setIsSelecting(true);
    } else if (!itemId && selectedTool !== 'select') {
      // Canvas click for adding items
      onCanvasClick(x, y);
    }
  }, [mode, selectedTool, selectedItems, onItemClick, onCanvasClick, getSVGCoordinates]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { x, y } = getSVGCoordinates(e.clientX, e.clientY);
    
    // Call parent mouse move handler for preview tracking
    if (onMouseMove) {
      onMouseMove(x, y);
    }
    
    if (isDragging && dragStart && mode === 'admin') {
      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;
      
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        onItemsMove(selectedItems, deltaX, deltaY);
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

  // Chunked rendering for large venues
  const [renderChunkIndex, setRenderChunkIndex] = useState(0);
  const [isRendering, setIsRendering] = useState(false);

  const renderChunks = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < visibleItems.length; i += RENDER_CHUNK_SIZE) {
      chunks.push(visibleItems.slice(i, i + RENDER_CHUNK_SIZE));
    }
    return chunks;
  }, [visibleItems]);

  // Progressive rendering for large datasets
  useEffect(() => {
    if (renderChunks.length > 1 && !isRendering) {
      setIsRendering(true);
      setRenderChunkIndex(0);
      
      const renderNextChunk = () => {
        setRenderChunkIndex(prev => {
          const next = prev + 1;
          if (next < renderChunks.length) {
            setTimeout(renderNextChunk, 16); // ~60fps
            return next;
          } else {
            setIsRendering(false);
            return prev;
          }
        });
      };
      
      setTimeout(renderNextChunk, 16);
    }
  }, [renderChunks.length, isRendering]);

  const itemsToRender = useMemo(() => {
    if (renderChunks.length <= 1) {
      return visibleItems;
    }
    return renderChunks.slice(0, renderChunkIndex + 1).flat();
  }, [renderChunks, renderChunkIndex, visibleItems]);

  const renderItem = useCallback((item: VenueItem) => {
    const color = getItemColor(item);
    const isSelected = selectedItems.includes(item.id);
    const isBooked = mode === 'user' && bookedSeats.includes(item.id);
    const isClickable = mode === 'admin' || (mode === 'user' && item.type === 'seat' && !isBooked);
    
    const commonProps = {
      transform: `translate(${item.x}, ${item.y}) rotate(${item.rotation || 0}, ${item.w/2}, ${item.h/2})`,
      style: { 
        cursor: isClickable ? 'pointer' : 'default',
        opacity: isBooked ? 0.6 : 1
      },
      onMouseDown: (e: React.MouseEvent) => isClickable && handleMouseDown(e, item.id),
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
      const shape = nonSeatItem.metadata?.shape || 'square';
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
          <text
            x={layout.canvas.w - 100}
            y={30}
            fill="#666"
            fontSize="12"
            textAnchor="middle"
          >
            Rendering... {Math.round((renderChunkIndex + 1) / renderChunks.length * 100)}%
          </text>
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
}> = ({ selectedTool, onToolSelect, selectedCategoryId }) => {
  const tools = [
    { id: 'select', name: 'Select', icon: MousePointer2, description: 'Select and move items' },
    { id: 'seat', name: 'Seat', icon: Circle, description: 'Add individual seats', requiresCategory: true },
    { id: 'table', name: 'Table', icon: Square, description: 'Add tables' },
    { id: 'booth', name: 'Booth', icon: Users, description: 'Add booths' },
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
                onClick={() => !isDisabled && onToolSelect(tool.id)}
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

// Main Dynamic Venue System Component
const DynamicVenueSystem: React.FC = () => {
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
  const [mode, setMode] = useState<'admin' | 'user'>('admin');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dragInProgress, setDragInProgress] = useState(false);
  const [pendingTableData, setPendingTableData] = useState<TableCreationData | null>(null);
  const [pendingBulkSeats, setPendingBulkSeats] = useState<any>(null);
  
  // Preview mode state
  const [previewMode, setPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const [groupId, setGroupId] = useState<string | null>(null);
  
  // Seat editing state
  const [editingSeatId, setEditingSeatId] = useState<string | null>(null);
  const [editingSeatNumber, setEditingSeatNumber] = useState<string>('');
  const [editingRowLabel, setEditingRowLabel] = useState<string>('');

  // Auto-select first category when available and create default category if none exist
  useEffect(() => {
    if (layout.categories.length === 0) {
      // Create a default category
      const defaultCategory = {
        id: `cat_${Date.now()}_default`,
        name: 'General',
        color: '#10b981',
        price: 50
      };
      dispatch({ type: 'ADD_CATEGORY', payload: defaultCategory });
    } else if (!selectedCategoryId) {
      setSelectedCategoryId(layout.categories[0].id);
    }
  }, [layout.categories, selectedCategoryId]);

  // Item click handler
  const handleItemClick = useCallback((id: string, multiSelect: boolean) => {
    setSelectedItems(prev => {
      if (multiSelect) {
        return prev.includes(id) 
          ? prev.filter(itemId => itemId !== id)
          : [...prev, id];
      } else {
        return prev.includes(id) && prev.length === 1 ? [] : [id];
      }
    });
  }, []);

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
      const optimalPosition = getOptimalSeatPosition();
      
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
    } else {
      const sizes: Record<string, { w: number; h: number }> = {
        table: { w: 60, h: 60 },
        booth: { w: 80, h: 40 },
        stage: { w: 120, h: 60 },
        screen: { w: 100, h: 20 },
        entry: { w: 40, h: 40 },
        exit: { w: 40, h: 40 },
        washroom: { w: 40, h: 40 }
      };

      const size = sizes[selectedTool] || baseSize;
      
      newItem = {
        id: `${selectedTool}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: selectedTool as any,
        x: Math.max(0, Math.min(layout.canvas.w - size.w, x - size.w/2)),
        y: Math.max(0, Math.min(layout.canvas.h - size.h, y - size.h/2)),
        w: size.w,
        h: size.h,
        label: selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)
      };
    }

    dispatch({ type: 'ADD_ITEMS', payload: [newItem] });
  }, [selectedTool, selectedCategoryId, layout.canvas, pendingTableData, pendingBulkSeats]);

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

  // Table creation handler
  const handleCreateTable = useCallback((tableData: TableCreationData, x: number, y: number) => {
    const tableId = `table_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const items: VenueItem[] = [];
    
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
      metadata: {
        shape: tableData.shape,
        seatCount: tableData.seatCount
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
        label: `${table.label}-${index + 1}`,
        metadata: {
          tableId: tableId,
          seatNumber: index + 1
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
    const seatRadius = 24; // Distance from table edge to seat center
  
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
        const perimeter = 2 * (width + height);
        const spacing = perimeter / seatCount;
        
        for (let i = 0; i < seatCount; i++) {
          const distance = i * spacing;
          let x, y;
          
          if (distance <= width) {
            // Top edge
            x = distance;
            y = -seatRadius;
          } else if (distance <= width + height) {
            // Right edge
            x = width + seatRadius;
            y = distance - width;
          } else if (distance <= 2 * width + height) {
            // Bottom edge
            x = width - (distance - width - height);
            y = height + seatRadius;
          } else {
            // Left edge
            x = -seatRadius;
            y = height - (distance - 2 * width - height);
          }
          
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
          groupId: groupId
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
          label: `${table.label}-${index + 1}`,
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
    dispatch({ type: 'SAVE_STATE' });
    // Scale each item individually
    ids.forEach(id => {
      const item = layout.items.find((i: any) => i.id === id);
      if (item) {
        const newWidth = Math.max(20, item.w * scaleFactor);
        const newHeight = Math.max(20, item.h * scaleFactor);
        dispatch({ 
          type: 'UPDATE_ITEM', 
          payload: { 
            id, 
            data: { w: newWidth, h: newHeight } 
          } 
        });
      }
    });
  }, [layout.items]);

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
    const optimizedPayload = {
      name: layout.name,
      items: layout.items,
      categories: layout.categories,
      canvas: layout.canvas,
      meta: {
        updated: new Date().toISOString(),
        version: (layout.meta?.version || 0) + 1
      }
    };
    
    console.log('Optimized Payload:', optimizedPayload);
    console.log('Payload Size:', JSON.stringify(optimizedPayload).length, 'bytes');
    
    // API call would go here
    alert('Layout saved successfully!');
  }, [layout]);

  const exportLayout = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(layout, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", (layout.name || "venue-layout") + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, [layout]);

  const importLayout = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedLayout = JSON.parse(e.target?.result as string);
        dispatch({ type: 'SET_LAYOUT', payload: importedLayout });
        setSelectedItems([]);
        alert('Layout imported successfully!');
      } catch (error) {
        alert('Error importing layout. Please check the file format.');
      }
    };
    reader.readAsText(file);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if editing a seat number or typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || editingSeatId) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
        setSelectedItems([]);
      } else if (((e.ctrlKey || e.metaKey) && e.key === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z')) {
        e.preventDefault();
        dispatch({ type: 'REDO' });
        setSelectedItems([]);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedItems.length > 0) {
          handleBulkDelete(selectedItems);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setSelectedItems(layout.items.map(item => item.id));
      } else if (e.key === 'F2' && selectedItems.length === 1) {
        // F2 to edit selected seat number
        e.preventDefault();
        const selectedItem = layout.items.find(item => item.id === selectedItems[0]);
        if (selectedItem && selectedItem.type === 'seat') {
          const mockEvent = { stopPropagation: () => {} } as React.MouseEvent;
          handleSeatDoubleClick(selectedItem.id, mockEvent);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedItems, layout.items, handleBulkDelete, editingSeatId, handleSeatDoubleClick]);

  const seatCount = layout.items.filter(item => item.type === 'seat').length;
  const canUndo = layout.historyIndex > 0;
  const canRedo = layout.historyIndex < layout.history.length - 1;

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden w-full max-w-full">
      {/* Mode Toggle */}
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

      {mode === 'admin' ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-2 border-b bg-white min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Input
                value={layout.name}
                onChange={(e) => {
                  // Note: This should update the layout name through a proper action
                  // For now we'll handle it in the component state
                }}
                className="text-sm font-semibold bg-transparent border-none p-0 h-auto max-w-48 min-w-0"
                placeholder="Venue Layout Name"
              />
              <Badge variant="secondary" className="text-xs px-2 py-1 whitespace-nowrap">{seatCount} seats</Badge>
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
                <ToolPalette
                  selectedTool={selectedTool}
                  onToolSelect={setSelectedTool}
                  selectedCategoryId={selectedCategoryId}
                />
                
                <CategoryManager
                  categories={layout.categories}
                  onAdd={addCategory}
                  onUpdate={updateCategory}
                  onRemove={removeCategory}
                  selectedId={selectedCategoryId}
                  onSelect={setSelectedCategoryId}
                />
                
                <SeatOverviewPanel
                  items={layout.items}
                  categories={layout.categories}
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