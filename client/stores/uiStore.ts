import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/react';

export type EditorMode = 'canvas' | 'sitemap' | 'code-preview';
export type ActivePanel = 'components' | 'layers' | 'properties' | 'none';
export type DevicePreset = 'desktop' | 'tablet' | 'mobile';

interface UIStore {
  // Editor mode
  editorMode: EditorMode;
  setEditorMode: (mode: EditorMode) => void;
  
  // Sidebar state
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  
  // Active panel
  activePanel: ActivePanel;
  setActivePanel: (panel: ActivePanel) => void;
  
  // Device preview
  devicePreset: DevicePreset;
  setDevicePreset: (preset: DevicePreset) => void;
  isPreviewMode: boolean;
  setPreviewMode: (enabled: boolean) => void;
  
  // Keyboard modifiers
  isCtrlPressed: boolean;
  isShiftPressed: boolean;
  isAltPressed: boolean;
  setCtrlPressed: (pressed: boolean) => void;
  setShiftPressed: (pressed: boolean) => void;
  setAltPressed: (pressed: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  subscribeWithSelector((set) => ({
    editorMode: 'canvas',
    setEditorMode: (mode) => set({ editorMode: mode }),
    
    leftPanelOpen: true,
    rightPanelOpen: true,
    toggleLeftPanel: () => set((state) => ({ leftPanelOpen: !state.leftPanelOpen })),
    toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
    
    activePanel: 'components',
    setActivePanel: (panel) => set({ activePanel: panel }),
    
    devicePreset: 'desktop',
    setDevicePreset: (preset) => set({ devicePreset: preset }),
    isPreviewMode: false,
    setPreviewMode: (enabled) => set({ isPreviewMode: enabled }),
    
    isCtrlPressed: false,
    isShiftPressed: false,
    isAltPressed: false,
    setCtrlPressed: (pressed) => set({ isCtrlPressed: pressed }),
    setShiftPressed: (pressed) => set({ isShiftPressed: pressed }),
    setAltPressed: (pressed) => set({ isAltPressed: pressed }),
  }))
);
