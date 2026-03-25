import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/react';

export interface CanvasComponent {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  props: Record<string, any>;
  children: string[]; // child component IDs
}

interface CanvasStore {
  // Components
  components: Map<string, CanvasComponent>;
  selectedIds: Set<string>;
  hoveredId: string | null;
  
  // Canvas interaction
  zoom: number;
  panX: number;
  panY: number;
  
  // Canvas grid
  snapGrid: number; // 8px default
  
  // Actions
  addComponent: (component: CanvasComponent) => void;
  updateComponent: (id: string, updates: Partial<CanvasComponent>) => void;
  deleteComponent: (id: string) => void;
  selectComponent: (id: string, multiSelect?: boolean) => void;
  deselectAll: () => void;
  setHoveredId: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  getComponents: () => CanvasComponent[];
  getSelectedComponents: () => CanvasComponent[];
}

export const useCanvasStore = create<CanvasStore>()(
  subscribeWithSelector((set, get) => ({
    components: new Map(),
    selectedIds: new Set(),
    hoveredId: null,
    zoom: 1,
    panX: 0,
    panY: 0,
    snapGrid: 8,

    addComponent: (component) =>
      set((state) => {
        const newComponents = new Map(state.components);
        newComponents.set(component.id, component);
        return { components: newComponents };
      }),

    updateComponent: (id, updates) =>
      set((state) => {
        const component = state.components.get(id);
        if (!component) return state;
        const newComponents = new Map(state.components);
        newComponents.set(id, { ...component, ...updates });
        return { components: newComponents };
      }),

    deleteComponent: (id) =>
      set((state) => {
        const newComponents = new Map(state.components);
        newComponents.delete(id);
        const newSelected = new Set(state.selectedIds);
        newSelected.delete(id);
        return { components: newComponents, selectedIds: newSelected };
      }),

    selectComponent: (id, multiSelect = false) =>
      set((state) => {
        let newSelected = new Set<string>();
        if (multiSelect) {
          newSelected = new Set(state.selectedIds);
          if (newSelected.has(id)) {
            newSelected.delete(id);
          } else {
            newSelected.add(id);
          }
        } else {
          newSelected.add(id);
        }
        return { selectedIds: newSelected };
      }),

    deselectAll: () => set({ selectedIds: new Set() }),

    setHoveredId: (id) => set({ hoveredId: id }),

    setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),

    setPan: (x, y) => set({ panX: x, panY: y }),

    getComponents: () => Array.from(get().components.values()),

    getSelectedComponents: () => {
      const { components, selectedIds } = get();
      return Array.from(selectedIds).map((id) => components.get(id)!).filter(Boolean);
    },
  }))
);
