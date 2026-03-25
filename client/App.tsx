import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { create } from 'zustand';
import { toast } from 'sonner';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  LayoutTemplate, AlignHorizontalDistributeCenter, Grid3X3, Type, AlignLeft,
  Navigation, PanelBottom, Image, MousePointer, CreditCard,
  TextCursorInput, TextIcon, ListFilter, Minus, Square, Columns, Rows,
  MousePointer2, Map, Code, Monitor, Tablet, Smartphone,
  Undo2, Redo2, ZoomIn, ZoomOut, PanelLeftClose, PanelRightClose,
  Save, Search, ChevronDown, ChevronRight, Layers, Component,
  Eye, EyeOff, Lock, Unlock, GripVertical, Plus, FileText, Trash2, Globe,
  Copy, Settings2, Palette, Box,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ComponentInstance {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  props: Record<string, any>;
  styles: Record<string, string>;
  tailwindClasses: string;
  children?: string[];
  parentId?: string;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  name: string;
}

interface PageData {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  children: string[];
  components: string[];
  meta: { title: string; description: string };
}

interface ProjectData {
  id: string;
  name: string;
  pages: Record<string, PageData>;
  rootPageId: string;
  createdAt: number;
  updatedAt: number;
}

type EditorMode = 'canvas' | 'sitemap' | 'code';
type DevicePreview = 'desktop' | 'tablet' | 'mobile';

interface CanvasTransform { x: number; y: number; scale: number; }

interface Command { execute: () => void; undo: () => void; description: string; }

// ─── Component Registry ──────────────────────────────────────────────────────

interface ComponentDefinition {
  type: string;
  label: string;
  category: string;
  icon: LucideIcon;
  defaultWidth: number;
  defaultHeight: number;
  defaultProps: Record<string, any>;
  defaultStyles: Record<string, string>;
  defaultTailwind: string;
}

const componentCategories = [
  { id: 'layout', label: 'Layout' },
  { id: 'typography', label: 'Typography' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'media', label: 'Media' },
  { id: 'interactive', label: 'Interactive' },
  { id: 'form', label: 'Form' },
  { id: 'data', label: 'Data' },
] as const;

const componentRegistry: ComponentDefinition[] = [
  { type: 'section', label: 'Section', category: 'layout', icon: LayoutTemplate, defaultWidth: 800, defaultHeight: 400, defaultProps: {}, defaultStyles: {}, defaultTailwind: 'py-16 px-8' },
  { type: 'container', label: 'Container', category: 'layout', icon: Square, defaultWidth: 600, defaultHeight: 300, defaultProps: {}, defaultStyles: {}, defaultTailwind: 'max-w-4xl mx-auto p-6' },
  { type: 'grid-2col', label: 'Grid 2 Col', category: 'layout', icon: Columns, defaultWidth: 600, defaultHeight: 200, defaultProps: { columns: 2 }, defaultStyles: {}, defaultTailwind: 'grid grid-cols-2 gap-4' },
  { type: 'grid-3col', label: 'Grid 3 Col', category: 'layout', icon: Grid3X3, defaultWidth: 600, defaultHeight: 200, defaultProps: { columns: 3 }, defaultStyles: {}, defaultTailwind: 'grid grid-cols-3 gap-4' },
  { type: 'flex-row', label: 'Flex Row', category: 'layout', icon: Rows, defaultWidth: 600, defaultHeight: 100, defaultProps: {}, defaultStyles: {}, defaultTailwind: 'flex items-center gap-4' },
  { type: 'heading', label: 'Heading', category: 'typography', icon: Type, defaultWidth: 400, defaultHeight: 56, defaultProps: { text: 'Heading Text', level: 'h2' }, defaultStyles: {}, defaultTailwind: 'text-3xl font-bold' },
  { type: 'paragraph', label: 'Paragraph', category: 'typography', icon: AlignLeft, defaultWidth: 400, defaultHeight: 80, defaultProps: { text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' }, defaultStyles: {}, defaultTailwind: 'text-base leading-relaxed' },
  { type: 'text-block', label: 'Text Block', category: 'typography', icon: TextIcon, defaultWidth: 500, defaultHeight: 120, defaultProps: { text: 'A longer text block with multiple sentences. Customize this content in the properties panel.' }, defaultStyles: {}, defaultTailwind: 'text-sm leading-relaxed' },
  { type: 'navbar', label: 'Navbar', category: 'navigation', icon: Navigation, defaultWidth: 800, defaultHeight: 64, defaultProps: { brand: 'Brand', links: ['Home', 'About', 'Contact'] }, defaultStyles: {}, defaultTailwind: 'flex items-center justify-between px-6 py-4 border-b' },
  { type: 'footer', label: 'Footer', category: 'navigation', icon: PanelBottom, defaultWidth: 800, defaultHeight: 120, defaultProps: { text: '© 2026 Company. All rights reserved.' }, defaultStyles: {}, defaultTailwind: 'py-8 px-6 text-center text-sm' },
  { type: 'image', label: 'Image', category: 'media', icon: Image, defaultWidth: 400, defaultHeight: 256, defaultProps: { src: '/placeholder.svg', alt: 'Placeholder image' }, defaultStyles: {}, defaultTailwind: 'rounded-lg object-cover w-full h-full' },
  { type: 'button', label: 'Button', category: 'interactive', icon: MousePointer, defaultWidth: 160, defaultHeight: 44, defaultProps: { text: 'Click Me', variant: 'primary' }, defaultStyles: {}, defaultTailwind: 'px-6 py-2.5 rounded-md font-medium text-sm' },
  { type: 'card', label: 'Card', category: 'interactive', icon: CreditCard, defaultWidth: 320, defaultHeight: 200, defaultProps: { title: 'Card Title', description: 'Card description goes here.' }, defaultStyles: {}, defaultTailwind: 'rounded-lg border p-6 shadow-sm' },
  { type: 'input', label: 'Input', category: 'form', icon: TextCursorInput, defaultWidth: 300, defaultHeight: 44, defaultProps: { placeholder: 'Enter text...', label: 'Label' }, defaultStyles: {}, defaultTailwind: 'rounded-md border px-3 py-2 text-sm w-full' },
  { type: 'textarea', label: 'Textarea', category: 'form', icon: AlignHorizontalDistributeCenter, defaultWidth: 300, defaultHeight: 100, defaultProps: { placeholder: 'Enter text...', label: 'Label' }, defaultStyles: {}, defaultTailwind: 'rounded-md border px-3 py-2 text-sm w-full' },
  { type: 'badge', label: 'Badge', category: 'data', icon: ListFilter, defaultWidth: 80, defaultHeight: 28, defaultProps: { text: 'Badge' }, defaultStyles: {}, defaultTailwind: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium' },
  { type: 'divider', label: 'Divider', category: 'data', icon: Minus, defaultWidth: 400, defaultHeight: 8, defaultProps: {}, defaultStyles: {}, defaultTailwind: 'border-t w-full' },
];

let nextZ = 1;

function createComponentInstance(def: ComponentDefinition, x: number, y: number): ComponentInstance {
  return {
    id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: def.type, x, y,
    width: def.defaultWidth, height: def.defaultHeight,
    props: { ...def.defaultProps }, styles: { ...def.defaultStyles },
    tailwindClasses: def.defaultTailwind,
    visible: true, locked: false, zIndex: nextZ++, name: def.label,
  };
}

function getDefinition(type: string): ComponentDefinition | undefined {
  return componentRegistry.find((c) => c.type === type);
}

// ─── UI Store ────────────────────────────────────────────────────────────────

interface UIState {
  mode: EditorMode;
  devicePreview: DevicePreview;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  leftPanelTab: 'components' | 'layers';
  rightPanelTab: 'properties' | 'styles';
  statusMessage: string;
  setMode: (mode: EditorMode) => void;
  setDevicePreview: (device: DevicePreview) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setLeftPanelTab: (tab: 'components' | 'layers') => void;
  setRightPanelTab: (tab: 'properties' | 'styles') => void;
  setStatusMessage: (msg: string) => void;
}

const useUIStore = create<UIState>((set) => ({
  mode: 'canvas', devicePreview: 'desktop', leftPanelOpen: true, rightPanelOpen: true,
  leftPanelTab: 'components', rightPanelTab: 'properties', statusMessage: 'Ready',
  setMode: (mode) => set({ mode }),
  setDevicePreview: (devicePreview) => set({ devicePreview }),
  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setLeftPanelTab: (leftPanelTab) => set({ leftPanelTab }),
  setRightPanelTab: (rightPanelTab) => set({ rightPanelTab }),
  setStatusMessage: (statusMessage) => set({ statusMessage }),
}));

// ─── Canvas Store ────────────────────────────────────────────────────────────

interface CanvasState {
  components: Record<string, ComponentInstance>;
  selectedIds: string[];
  transform: CanvasTransform;
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  isPanning: boolean;
  clipboard: ComponentInstance[];
  history: Command[];
  historyIndex: number;
  addComponent: (component: ComponentInstance) => void;
  removeComponents: (ids: string[]) => void;
  updateComponent: (id: string, updates: Partial<ComponentInstance>) => void;
  selectComponents: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  clearSelection: () => void;
  setTransform: (transform: Partial<CanvasTransform>) => void;
  zoomTo: (scale: number, centerX?: number, centerY?: number) => void;
  setIsPanning: (isPanning: boolean) => void;
  moveComponents: (ids: string[], dx: number, dy: number) => void;
  resizeComponent: (id: string, width: number, height: number) => void;
  reorderComponent: (id: string, newZIndex: number) => void;
  duplicateComponents: (ids: string[]) => void;
  copyToClipboard: (ids: string[]) => void;
  pasteFromClipboard: () => void;
  executeCommand: (command: Command) => void;
  undo: () => void;
  redo: () => void;
  snapValue: (value: number) => number;
  setShowGrid: (show: boolean) => void;
}

const generateId = () => `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const useCanvasStore = create<CanvasState>((set, get) => ({
  components: {}, selectedIds: [],
  transform: { x: 0, y: 0, scale: 1 },
  gridSize: 8, snapToGrid: true, showGrid: true, isPanning: false,
  clipboard: [], history: [], historyIndex: -1,

  addComponent: (component) => set((s) => ({ components: { ...s.components, [component.id]: component } })),
  removeComponents: (ids) => set((s) => {
    const components = { ...s.components };
    ids.forEach((id) => delete components[id]);
    return { components, selectedIds: s.selectedIds.filter((id) => !ids.includes(id)) };
  }),
  updateComponent: (id, updates) => set((s) => ({ components: { ...s.components, [id]: { ...s.components[id], ...updates } } })),
  selectComponents: (ids) => set({ selectedIds: ids }),
  addToSelection: (id) => set((s) => ({ selectedIds: s.selectedIds.includes(id) ? s.selectedIds : [...s.selectedIds, id] })),
  clearSelection: () => set({ selectedIds: [] }),
  setTransform: (transform) => set((s) => ({ transform: { ...s.transform, ...transform } })),
  zoomTo: (scale, centerX, centerY) => {
    const clamped = Math.min(Math.max(scale, 0.1), 5);
    set((s) => {
      if (centerX !== undefined && centerY !== undefined) {
        const ratio = clamped / s.transform.scale;
        return { transform: { x: centerX - (centerX - s.transform.x) * ratio, y: centerY - (centerY - s.transform.y) * ratio, scale: clamped } };
      }
      return { transform: { ...s.transform, scale: clamped } };
    });
  },
  setIsPanning: (isPanning) => set({ isPanning }),
  moveComponents: (ids, dx, dy) => {
    const { snapValue, snapToGrid } = get();
    set((s) => {
      const components = { ...s.components };
      ids.forEach((id) => {
        if (components[id] && !components[id].locked) {
          const newX = components[id].x + dx;
          const newY = components[id].y + dy;
          components[id] = { ...components[id], x: snapToGrid ? snapValue(newX) : newX, y: snapToGrid ? snapValue(newY) : newY };
        }
      });
      return { components };
    });
  },
  resizeComponent: (id, width, height) => {
    const { snapValue, snapToGrid } = get();
    set((s) => ({
      components: { ...s.components, [id]: { ...s.components[id], width: snapToGrid ? snapValue(Math.max(24, width)) : Math.max(24, width), height: snapToGrid ? snapValue(Math.max(24, height)) : Math.max(24, height) } },
    }));
  },
  reorderComponent: (id, newZIndex) => set((s) => ({ components: { ...s.components, [id]: { ...s.components[id], zIndex: newZIndex } } })),
  duplicateComponents: (ids) => set((s) => {
    const components = { ...s.components };
    const newIds: string[] = [];
    ids.forEach((id) => {
      const original = components[id];
      if (original) {
        const newId = generateId();
        newIds.push(newId);
        components[newId] = { ...original, id: newId, x: original.x + 20, y: original.y + 20, zIndex: nextZ++, name: `${original.name} copy` };
      }
    });
    return { components, selectedIds: newIds };
  }),
  copyToClipboard: (ids) => { const { components } = get(); set({ clipboard: ids.map((id) => components[id]).filter(Boolean) }); },
  pasteFromClipboard: () => {
    const { clipboard } = get();
    if (clipboard.length === 0) return;
    set((s) => {
      const components = { ...s.components };
      const newIds: string[] = [];
      clipboard.forEach((comp) => {
        const newId = generateId();
        newIds.push(newId);
        components[newId] = { ...comp, id: newId, x: comp.x + 40, y: comp.y + 40, zIndex: nextZ++, name: `${comp.name} copy` };
      });
      return { components, selectedIds: newIds };
    });
  },
  executeCommand: (command) => {
    command.execute();
    set((s) => ({ history: [...s.history.slice(0, s.historyIndex + 1), command], historyIndex: s.historyIndex + 1 }));
  },
  undo: () => { const { history, historyIndex } = get(); if (historyIndex >= 0) { history[historyIndex].undo(); set({ historyIndex: historyIndex - 1 }); } },
  redo: () => { const { history, historyIndex } = get(); if (historyIndex < history.length - 1) { history[historyIndex + 1].execute(); set({ historyIndex: historyIndex + 1 }); } },
  snapValue: (value) => { const { gridSize } = get(); return Math.round(value / gridSize) * gridSize; },
  setShowGrid: (show) => set({ showGrid: show }),
}));

// ─── Project Store ───────────────────────────────────────────────────────────

const generatePageId = () => `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const createDefaultPage = (): PageData => ({ id: 'page_home', name: 'Home', slug: '/', children: [], components: [], meta: { title: 'Home', description: '' } });

const createDefaultProject = (): ProjectData => {
  const homePage = createDefaultPage();
  return { id: `proj_${Date.now()}`, name: 'Untitled Project', pages: { [homePage.id]: homePage }, rootPageId: homePage.id, createdAt: Date.now(), updatedAt: Date.now() };
};

interface ProjectState {
  project: ProjectData;
  activePageId: string;
  setProjectName: (name: string) => void;
  addPage: (name: string, parentId?: string) => string;
  removePage: (id: string) => void;
  updatePage: (id: string, updates: Partial<PageData>) => void;
  setActivePage: (id: string) => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  exportProject: () => string;
  importProject: (json: string) => void;
}

const useProjectStore = create<ProjectState>((set, get) => ({
  project: createDefaultProject(),
  activePageId: 'page_home',
  setProjectName: (name) => set((s) => ({ project: { ...s.project, name, updatedAt: Date.now() } })),
  addPage: (name, parentId) => {
    const id = generatePageId();
    const page: PageData = { id, name, slug: `/${name.toLowerCase().replace(/\s+/g, '-')}`, parentId, children: [], components: [], meta: { title: name, description: '' } };
    set((s) => {
      const pages = { ...s.project.pages, [id]: page };
      if (parentId && pages[parentId]) {
        pages[parentId] = { ...pages[parentId], children: [...pages[parentId].children, id] };
      }
      return { project: { ...s.project, pages, updatedAt: Date.now() } };
    });
    return id;
  },
  removePage: (id) => set((s) => {
    if (id === s.project.rootPageId) return s;
    const pages = { ...s.project.pages };
    const page = pages[id];
    if (page?.parentId && pages[page.parentId]) {
      pages[page.parentId] = { ...pages[page.parentId], children: pages[page.parentId].children.filter((c) => c !== id) };
    }
    delete pages[id];
    return { project: { ...s.project, pages, updatedAt: Date.now() }, activePageId: s.activePageId === id ? s.project.rootPageId : s.activePageId };
  }),
  updatePage: (id, updates) => set((s) => ({ project: { ...s.project, pages: { ...s.project.pages, [id]: { ...s.project.pages[id], ...updates } }, updatedAt: Date.now() } })),
  setActivePage: (activePageId) => set({ activePageId }),
  saveToLocalStorage: () => { const { project } = get(); localStorage.setItem('builder_project', JSON.stringify(project)); },
  loadFromLocalStorage: () => {
    const data = localStorage.getItem('builder_project');
    if (data) { try { const project = JSON.parse(data) as ProjectData; set({ project, activePageId: project.rootPageId }); return true; } catch { return false; } }
    return false;
  },
  exportProject: () => JSON.stringify(get().project, null, 2),
  importProject: (json) => { try { const project = JSON.parse(json) as ProjectData; set({ project, activePageId: project.rootPageId }); } catch (e) { console.error('Failed to import project', e); } },
}));

// ─── Component Renderer ─────────────────────────────────────────────────────

const ComponentRenderer: React.FC<{ component: ComponentInstance; isPreview?: boolean }> = ({ component, isPreview }) => {
  const { type, props, tailwindClasses } = component;
  const baseClass = `${tailwindClasses} ${isPreview ? '' : 'pointer-events-none select-none'}`;

  switch (type) {
    case 'section':
      return <div className={`${baseClass} bg-muted/30 min-h-[100px]`}><span className="text-muted-foreground text-xs">Section</span></div>;
    case 'container':
      return <div className={`${baseClass} bg-muted/20 min-h-[80px] border border-dashed border-muted`}><span className="text-muted-foreground text-xs">Container</span></div>;
    case 'grid-2col':
    case 'grid-3col': {
      const cols = type === 'grid-2col' ? 2 : 3;
      return (
        <div className={baseClass}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="bg-muted/20 border border-dashed border-muted rounded p-4 min-h-[60px]">
              <span className="text-muted-foreground text-xs">Col {i + 1}</span>
            </div>
          ))}
        </div>
      );
    }
    case 'flex-row':
      return (
        <div className={baseClass}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-muted/20 border border-dashed border-muted rounded px-4 py-2">
              <span className="text-muted-foreground text-xs">Item {i}</span>
            </div>
          ))}
        </div>
      );
    case 'heading': {
      const Tag = (props.level || 'h2') as keyof JSX.IntrinsicElements;
      return <Tag className={baseClass}>{props.text || 'Heading'}</Tag>;
    }
    case 'paragraph':
    case 'text-block':
      return <p className={baseClass}>{props.text}</p>;
    case 'navbar':
      return (
        <nav className={`${baseClass} bg-background`}>
          <span className="font-bold">{props.brand}</span>
          <div className="flex gap-4">
            {(props.links || []).map((link: string, i: number) => (
              <span key={i} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">{link}</span>
            ))}
          </div>
        </nav>
      );
    case 'footer':
      return <footer className={`${baseClass} bg-muted/30 text-muted-foreground`}>{props.text}</footer>;
    case 'image':
      return <img src={props.src} alt={props.alt} className={baseClass} />;
    case 'button':
      return (
        <button className={`${baseClass} ${props.variant === 'primary' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
          {props.text}
        </button>
      );
    case 'card':
      return (
        <div className={`${baseClass} bg-card text-card-foreground`}>
          <h3 className="text-lg font-semibold mb-2">{props.title}</h3>
          <p className="text-sm text-muted-foreground">{props.description}</p>
        </div>
      );
    case 'input':
      return (
        <div className="w-full">
          {props.label && <label className="text-sm font-medium mb-1 block text-foreground">{props.label}</label>}
          <input className={baseClass} placeholder={props.placeholder} readOnly />
        </div>
      );
    case 'textarea':
      return (
        <div className="w-full">
          {props.label && <label className="text-sm font-medium mb-1 block text-foreground">{props.label}</label>}
          <textarea className={`${baseClass} resize-none`} placeholder={props.placeholder} rows={3} readOnly />
        </div>
      );
    case 'badge':
      return <span className={`${baseClass} bg-primary/10 text-primary`}>{props.text}</span>;
    case 'divider':
      return <hr className={baseClass} />;
    default:
      return <div className={baseClass}>Unknown: {type}</div>;
  }
};

// ─── Canvas Component (wrapper for each element on canvas) ───────────────────

const CanvasComponent: React.FC<{ component: ComponentInstance; isSelected: boolean }> = React.memo(({ component, isSelected }) => {
  if (!component.visible) return null;
  return (
    <div
      data-component-id={component.id}
      className={`absolute group ${component.locked ? 'pointer-events-none opacity-70' : ''}`}
      style={{ left: component.x, top: component.y, width: component.width, height: component.height, zIndex: component.zIndex }}
    >
      <div className="w-full h-full overflow-hidden">
        <ComponentRenderer component={component} />
      </div>
      {isSelected && (
        <>
          <div className="absolute inset-0 border-2 border-primary rounded-sm pointer-events-none" />
          <div className="absolute -top-5 left-0 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-sm whitespace-nowrap pointer-events-none">
            {component.name}
          </div>
          {!component.locked && (
            <>
              <div data-resize-handle="nw" className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-primary border border-primary-foreground rounded-sm cursor-nw-resize" />
              <div data-resize-handle="ne" className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary border border-primary-foreground rounded-sm cursor-ne-resize" />
              <div data-resize-handle="sw" className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-primary border border-primary-foreground rounded-sm cursor-sw-resize" />
              <div data-resize-handle="se" className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-primary border border-primary-foreground rounded-sm cursor-se-resize" />
              <div data-resize-handle="n" className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-primary border border-primary-foreground rounded-sm cursor-n-resize" />
              <div data-resize-handle="s" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-primary border border-primary-foreground rounded-sm cursor-s-resize" />
              <div data-resize-handle="w" className="absolute top-1/2 -left-1 -translate-y-1/2 w-2.5 h-2.5 bg-primary border border-primary-foreground rounded-sm cursor-w-resize" />
              <div data-resize-handle="e" className="absolute top-1/2 -right-1 -translate-y-1/2 w-2.5 h-2.5 bg-primary border border-primary-foreground rounded-sm cursor-e-resize" />
            </>
          )}
        </>
      )}
    </div>
  );
});
CanvasComponent.displayName = 'CanvasComponent';

// ─── Canvas ──────────────────────────────────────────────────────────────────

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    components, selectedIds, transform, showGrid,
    selectComponents, clearSelection, addComponent,
    setTransform, zoomTo, setIsPanning,
    removeComponents, duplicateComponents, copyToClipboard, pasteFromClipboard,
    undo, redo,
  } = useCanvasStore();

  const [dragState, setDragState] = useState<{
    type: 'move' | 'resize' | 'pan' | 'select-box' | null;
    startX: number; startY: number; currentX: number; currentY: number;
    handle?: string; componentId?: string;
    initialPositions?: Record<string, { x: number; y: number }>;
    initialSize?: { width: number; height: number };
    initialPos?: { x: number; y: number };
  }>({ type: null, startX: 0, startY: 0, currentX: 0, currentY: 0 });

  const [spaceHeld, setSpaceHeld] = useState(false);

  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: (screenX - rect.left - transform.x) / transform.scale, y: (screenY - rect.top - transform.y) / transform.scale };
  }, [transform]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space' && !e.repeat) { e.preventDefault(); setSpaceHeld(true); }
      if (e.key === 'Delete' || e.key === 'Backspace') { if (selectedIds.length > 0) removeComponents(selectedIds); }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
        else if (e.key === 'z') { e.preventDefault(); undo(); }
        else if (e.key === 'c') { e.preventDefault(); copyToClipboard(selectedIds); }
        else if (e.key === 'v') { e.preventDefault(); pasteFromClipboard(); }
        else if (e.key === 'd') { e.preventDefault(); duplicateComponents(selectedIds); }
        else if (e.key === 'a') { e.preventDefault(); selectComponents(Object.keys(components)); }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') setSpaceHeld(false); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [selectedIds, components, removeComponents, undo, redo, copyToClipboard, pasteFromClipboard, duplicateComponents, selectComponents]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomTo(transform.scale + delta * transform.scale, e.clientX - rect.left, e.clientY - rect.top);
  }, [transform.scale, zoomTo]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && spaceHeld)) {
      setDragState({ type: 'pan', startX: e.clientX - transform.x, startY: e.clientY - transform.y, currentX: e.clientX, currentY: e.clientY });
      setIsPanning(true);
      return;
    }
    if (e.button === 0) {
      const target = e.target as HTMLElement;
      const compEl = target.closest('[data-component-id]') as HTMLElement | null;
      if (compEl) {
        const id = compEl.dataset.componentId!;
        const comp = components[id];
        if (comp?.locked) return;
        if (e.shiftKey) {
          if (selectedIds.includes(id)) selectComponents(selectedIds.filter((s) => s !== id));
          else selectComponents([...selectedIds, id]);
        } else if (!selectedIds.includes(id)) selectComponents([id]);

        const handleEl = target.closest('[data-resize-handle]') as HTMLElement | null;
        if (handleEl) {
          setDragState({
            type: 'resize', startX: e.clientX, startY: e.clientY, currentX: e.clientX, currentY: e.clientY,
            handle: handleEl.dataset.resizeHandle, componentId: id,
            initialSize: { width: comp.width, height: comp.height },
            initialPos: { x: comp.x, y: comp.y },
          });
          return;
        }
        const idsToMove = selectedIds.includes(id) ? selectedIds : [id];
        const initialPositions: Record<string, { x: number; y: number }> = {};
        idsToMove.forEach((mid) => { if (components[mid]) initialPositions[mid] = { x: components[mid].x, y: components[mid].y }; });
        setDragState({ type: 'move', startX: e.clientX, startY: e.clientY, currentX: e.clientX, currentY: e.clientY, initialPositions });
      } else {
        clearSelection();
        setDragState({ type: 'select-box', startX: e.clientX, startY: e.clientY, currentX: e.clientX, currentY: e.clientY });
      }
    }
  }, [spaceHeld, transform, components, selectedIds, selectComponents, clearSelection, setIsPanning]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.type) return;
    if (dragState.type === 'pan') {
      setTransform({ x: e.clientX - dragState.startX, y: e.clientY - dragState.startY });
      return;
    }
    if (dragState.type === 'move' && dragState.initialPositions) {
      const dx = (e.clientX - dragState.startX) / transform.scale;
      const dy = (e.clientY - dragState.startY) / transform.scale;
      const ids = Object.keys(dragState.initialPositions);
      const { snapValue, snapToGrid } = useCanvasStore.getState();
      ids.forEach((id) => {
        const init = dragState.initialPositions![id];
        const newX = init.x + dx;
        const newY = init.y + dy;
        useCanvasStore.getState().updateComponent(id, { x: snapToGrid ? snapValue(newX) : newX, y: snapToGrid ? snapValue(newY) : newY });
      });
      return;
    }
    if (dragState.type === 'resize' && dragState.componentId && dragState.initialSize && dragState.initialPos) {
      const dx = (e.clientX - dragState.startX) / transform.scale;
      const dy = (e.clientY - dragState.startY) / transform.scale;
      const handle = dragState.handle || 'se';
      let newW = dragState.initialSize.width;
      let newH = dragState.initialSize.height;
      let newX = dragState.initialPos.x;
      let newY = dragState.initialPos.y;

      if (handle.includes('e')) newW += dx;
      if (handle.includes('s')) newH += dy;
      if (handle.includes('w')) { newW -= dx; newX += dx; }
      if (handle.includes('n')) { newH -= dy; newY += dy; }

      newW = Math.max(24, newW);
      newH = Math.max(24, newH);

      // Clamp position if min size reached
      if (handle.includes('w') && newW === 24) newX = dragState.initialPos.x + dragState.initialSize.width - 24;
      if (handle.includes('n') && newH === 24) newY = dragState.initialPos.y + dragState.initialSize.height - 24;

      const { snapValue, snapToGrid } = useCanvasStore.getState();
      useCanvasStore.getState().updateComponent(dragState.componentId, {
        width: snapToGrid ? snapValue(newW) : newW,
        height: snapToGrid ? snapValue(newH) : newH,
        x: snapToGrid ? snapValue(newX) : newX,
        y: snapToGrid ? snapValue(newY) : newY,
      });
      return;
    }
    if (dragState.type === 'select-box') {
      setDragState((prev) => ({ ...prev, currentX: e.clientX, currentY: e.clientY }));
    }
  }, [dragState, transform.scale, setTransform]);

  const handleMouseUp = useCallback(() => {
    if (dragState.type === 'pan') setIsPanning(false);
    if (dragState.type === 'select-box') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x1 = Math.min(dragState.startX, dragState.currentX);
        const y1 = Math.min(dragState.startY, dragState.currentY);
        const x2 = Math.max(dragState.startX, dragState.currentX);
        const y2 = Math.max(dragState.startY, dragState.currentY);
        if (Math.abs(x2 - x1) > 5 || Math.abs(y2 - y1) > 5) {
          const canvasX1 = (x1 - rect.left - transform.x) / transform.scale;
          const canvasY1 = (y1 - rect.top - transform.y) / transform.scale;
          const canvasX2 = (x2 - rect.left - transform.x) / transform.scale;
          const canvasY2 = (y2 - rect.top - transform.y) / transform.scale;
          const ids = Object.values(components).filter((c) => c.x < canvasX2 && c.x + c.width > canvasX1 && c.y < canvasY2 && c.y + c.height > canvasY1).map((c) => c.id);
          selectComponents(ids);
        }
      }
    }
    setDragState({ type: null, startX: 0, startY: 0, currentX: 0, currentY: 0 });
  }, [dragState, transform, components, selectComponents, setIsPanning]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('component-type');
    if (!type) return;
    const def = componentRegistry.find((c) => c.type === type);
    if (!def) return;
    const pos = screenToCanvas(e.clientX, e.clientY);
    const instance = createComponentInstance(def, pos.x - def.defaultWidth / 2, pos.y - def.defaultHeight / 2);
    addComponent(instance);
    selectComponents([instance.id]);
  }, [screenToCanvas, addComponent, selectComponents]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }, []);

  const gridSize = 8 * transform.scale;
  const gridStyle = showGrid ? {
    backgroundImage: `radial-gradient(circle, hsl(var(--canvas-dot)) ${Math.max(0.5, transform.scale * 0.8)}px, transparent ${Math.max(0.5, transform.scale * 0.8)}px)`,
    backgroundSize: `${gridSize}px ${gridSize}px`,
    backgroundPosition: `${transform.x % gridSize}px ${transform.y % gridSize}px`,
  } : {};

  const sortedComponents = Object.values(components).sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      ref={canvasRef}
      className={`flex-1 overflow-hidden relative ${spaceHeld ? 'cursor-grab' : 'cursor-default'} ${dragState.type === 'pan' ? 'cursor-grabbing' : ''}`}
      style={{ backgroundColor: 'hsl(var(--canvas))', ...gridStyle }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0', position: 'absolute', top: 0, left: 0 }}>
        {sortedComponents.map((comp) => (
          <CanvasComponent key={comp.id} component={comp} isSelected={selectedIds.includes(comp.id)} />
        ))}
      </div>
      {dragState.type === 'select-box' && (
        <div
          className="absolute border border-primary bg-primary/10 pointer-events-none"
          style={{
            left: Math.min(dragState.startX, dragState.currentX) - (canvasRef.current?.getBoundingClientRect().left || 0),
            top: Math.min(dragState.startY, dragState.currentY) - (canvasRef.current?.getBoundingClientRect().top || 0),
            width: Math.abs(dragState.currentX - dragState.startX),
            height: Math.abs(dragState.currentY - dragState.startY),
          }}
        />
      )}
      <div className="absolute bottom-2 left-2 text-[10px] text-muted-foreground bg-toolbar/80 backdrop-blur px-2 py-1 rounded">
        {Math.round(transform.scale * 100)}% · {Object.keys(components).length} components
      </div>
    </div>
  );
};

// ─── Layer Panel ─────────────────────────────────────────────────────────────

const LayerPanel: React.FC = () => {
  const { components, selectedIds, selectComponents, updateComponent } = useCanvasStore();
  const sorted = Object.values(components).sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="flex-1 overflow-y-auto">
      {sorted.length === 0 ? (
        <div className="p-4 text-xs text-muted-foreground text-center">No components on canvas.<br />Drag components from the library.</div>
      ) : (
        sorted.map((comp) => (
          <div
            key={comp.id}
            onClick={() => selectComponents([comp.id])}
            className={`flex items-center gap-1.5 px-2 py-1.5 text-xs cursor-pointer transition-colors border-l-2 ${
              selectedIds.includes(comp.id) ? 'bg-primary/10 border-l-primary text-foreground' : 'border-l-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            }`}
          >
            <GripVertical className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
            <span className="truncate flex-1">{comp.name}</span>
            <button onClick={(e) => { e.stopPropagation(); updateComponent(comp.id, { visible: !comp.visible }); }} className="p-0.5 hover:text-foreground">
              {comp.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); updateComponent(comp.id, { locked: !comp.locked }); }} className="p-0.5 hover:text-foreground">
              {comp.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

// ─── Component Library ───────────────────────────────────────────────────────

const ComponentLibrary: React.FC = () => {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(componentCategories.map((c) => c.id)));
  const { leftPanelTab, setLeftPanelTab } = useUIStore();

  const filtered = componentRegistry.filter((c) => c.label.toLowerCase().includes(search.toLowerCase()));

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('component-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="flex flex-col h-full bg-panel">
      <div className="flex border-b border-panel-border">
        <button onClick={() => setLeftPanelTab('components')} className={`flex-1 px-3 py-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${leftPanelTab === 'components' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <Component className="w-3.5 h-3.5" /> Components
        </button>
        <button onClick={() => setLeftPanelTab('layers')} className={`flex-1 px-3 py-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${leftPanelTab === 'layers' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <Layers className="w-3.5 h-3.5" /> Layers
        </button>
      </div>
      {leftPanelTab === 'components' ? (
        <>
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search components..." className="w-full bg-secondary rounded-md pl-7 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {componentCategories.map((cat) => {
              const items = filtered.filter((c) => c.category === cat.id);
              if (items.length === 0) return null;
              const expanded = expandedCategories.has(cat.id);
              return (
                <div key={cat.id} className="mb-1">
                  <button onClick={() => toggleCategory(cat.id)} className="flex items-center w-full px-1 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    {expanded ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                    {cat.label}
                    <span className="ml-auto text-[10px] text-muted-foreground">{items.length}</span>
                  </button>
                  {expanded && (
                    <div className="grid grid-cols-2 gap-1">
                      {items.map((comp) => (
                        <div key={comp.type} draggable onDragStart={(e) => handleDragStart(e, comp.type)} className="flex flex-col items-center gap-1 p-2 rounded-md bg-secondary/50 hover:bg-secondary cursor-grab active:cursor-grabbing transition-colors border border-transparent hover:border-panel-border">
                          <comp.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground text-center leading-tight">{comp.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <LayerPanel />
      )}
    </div>
  );
};

// ─── Properties Panel ────────────────────────────────────────────────────────

const Section: React.FC<{ icon: any; title: string; children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
  <div className="px-3 py-2 border-b border-panel-border">
    <div className="flex items-center gap-1.5 mb-2">
      <Icon className="w-3 h-3 text-muted-foreground" />
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
    </div>
    <div className="space-y-2">{children}</div>
  </div>
);

const Field: React.FC<{ label: string; value: any; onChange: (v: string) => void; type?: string }> = ({ label, value, onChange, type = 'text' }) => (
  <div>
    <Label className="text-[10px] text-muted-foreground">{label}</Label>
    <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-6 text-xs bg-secondary border-panel-border mt-0.5" />
  </div>
);

const PropertiesPanel: React.FC = () => {
  const { components, selectedIds, updateComponent } = useCanvasStore();

  if (selectedIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <Settings2 className="w-8 h-8 text-muted-foreground/30 mb-2" />
        <p className="text-xs text-muted-foreground">Select a component to edit its properties</p>
      </div>
    );
  }
  if (selectedIds.length > 1) {
    return <div className="p-4 text-xs text-muted-foreground text-center">{selectedIds.length} components selected</div>;
  }

  const comp = components[selectedIds[0]];
  if (!comp) return null;
  const def = getDefinition(comp.type);
  const updateProp = (key: string, value: any) => { updateComponent(comp.id, { props: { ...comp.props, [key]: value } }); };

  return (
    <div className="flex flex-col h-full bg-panel overflow-y-auto">
      <div className="px-3 py-2 border-b border-panel-border">
        <div className="flex items-center gap-2">
          {def && <def.icon className="w-3.5 h-3.5 text-primary" />}
          <input value={comp.name} onChange={(e) => updateComponent(comp.id, { name: e.target.value })} className="text-xs font-medium bg-transparent outline-none text-foreground flex-1" />
        </div>
        <span className="text-[10px] text-muted-foreground">{comp.type}</span>
      </div>
      <Section icon={Box} title="Layout">
        <div className="grid grid-cols-2 gap-2">
          <Field label="X" value={comp.x} onChange={(v) => updateComponent(comp.id, { x: Number(v) })} type="number" />
          <Field label="Y" value={comp.y} onChange={(v) => updateComponent(comp.id, { y: Number(v) })} type="number" />
          <Field label="W" value={comp.width} onChange={(v) => updateComponent(comp.id, { width: Number(v) })} type="number" />
          <Field label="H" value={comp.height} onChange={(v) => updateComponent(comp.id, { height: Number(v) })} type="number" />
        </div>
      </Section>
      {comp.props.text !== undefined && (
        <Section icon={Type} title="Content">
          <div>
            <Label className="text-[10px] text-muted-foreground">Text</Label>
            <textarea value={comp.props.text} onChange={(e) => updateProp('text', e.target.value)} className="w-full bg-secondary rounded-md px-2 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring resize-none mt-1" rows={3} />
          </div>
        </Section>
      )}
      {comp.props.brand !== undefined && (
        <Section icon={Type} title="Content">
          <Field label="Brand" value={comp.props.brand} onChange={(v) => updateProp('brand', v)} />
        </Section>
      )}
      {comp.props.title !== undefined && comp.type === 'card' && (
        <Section icon={Type} title="Content">
          <Field label="Title" value={comp.props.title} onChange={(v) => updateProp('title', v)} />
          <Field label="Description" value={comp.props.description || ''} onChange={(v) => updateProp('description', v)} />
        </Section>
      )}
      {comp.props.placeholder !== undefined && (
        <Section icon={Type} title="Content">
          <Field label="Label" value={comp.props.label || ''} onChange={(v) => updateProp('label', v)} />
          <Field label="Placeholder" value={comp.props.placeholder} onChange={(v) => updateProp('placeholder', v)} />
        </Section>
      )}
      <Section icon={Palette} title="Tailwind Classes">
        <textarea value={comp.tailwindClasses} onChange={(e) => updateComponent(comp.id, { tailwindClasses: e.target.value })} className="w-full bg-secondary rounded-md px-2 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring resize-none font-mono" rows={3} placeholder="e.g. bg-blue-500 text-white p-4" />
      </Section>
      <Section icon={Box} title="Layer Order">
        <div className="flex items-center gap-2">
          <Label className="text-[10px] text-muted-foreground w-12">Z-Index</Label>
          <Input type="number" value={comp.zIndex} onChange={(e) => updateComponent(comp.id, { zIndex: Number(e.target.value) })} className="h-6 text-xs bg-secondary border-panel-border" />
        </div>
      </Section>
    </div>
  );
};

// ─── Sitemap View ────────────────────────────────────────────────────────────

const SitemapView: React.FC = () => {
  const { project, activePageId, setActivePage, addPage, removePage, updatePage } = useProjectStore();
  const [newPageName, setNewPageName] = useState('');

  const handleAddPage = () => {
    if (!newPageName.trim()) return;
    addPage(newPageName.trim(), project.rootPageId);
    setNewPageName('');
  };

  const renderPageNode = (pageId: string, depth = 0) => {
    const page = project.pages[pageId];
    if (!page) return null;
    const isActive = activePageId === pageId;
    return (
      <div key={pageId}>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary'}`} style={{ paddingLeft: `${depth * 20 + 12}px` }} onClick={() => setActivePage(pageId)}>
          {page.children.length > 0 ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <FileText className="w-3 h-3 text-muted-foreground" />}
          <Globe className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs flex-1 truncate">{page.name}</span>
          <span className="text-[10px] text-muted-foreground font-mono">{page.slug}</span>
          {pageId !== project.rootPageId && (
            <button onClick={(e) => { e.stopPropagation(); removePage(pageId); }} className="p-0.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
        {page.children.map((childId) => renderPageNode(childId, depth + 1))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-canvas p-6">
      <div className="max-w-2xl mx-auto w-full">
        <h2 className="text-lg font-semibold text-foreground mb-4">Sitemap</h2>
        <div className="flex gap-2 mb-4">
          <Input value={newPageName} onChange={(e) => setNewPageName(e.target.value)} placeholder="New page name..." className="h-8 text-xs bg-secondary border-panel-border" onKeyDown={(e) => e.key === 'Enter' && handleAddPage()} />
          <Button size="sm" onClick={handleAddPage} className="h-8 text-xs"><Plus className="w-3 h-3 mr-1" /> Add</Button>
        </div>
        <div className="bg-panel rounded-lg border border-panel-border p-2">{renderPageNode(project.rootPageId)}</div>
        {activePageId && project.pages[activePageId] && (
          <div className="mt-4 bg-panel rounded-lg border border-panel-border p-4 space-y-3">
            <h3 className="text-sm font-medium text-foreground">Page Settings</h3>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase">Title</label>
              <Input value={project.pages[activePageId].meta.title} onChange={(e) => updatePage(activePageId, { meta: { ...project.pages[activePageId].meta, title: e.target.value } })} className="h-7 text-xs bg-secondary border-panel-border mt-1" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase">Description</label>
              <Input value={project.pages[activePageId].meta.description} onChange={(e) => updatePage(activePageId, { meta: { ...project.pages[activePageId].meta, description: e.target.value } })} className="h-7 text-xs bg-secondary border-panel-border mt-1" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase">URL Slug</label>
              <Input value={project.pages[activePageId].slug} onChange={(e) => updatePage(activePageId, { slug: e.target.value })} className="h-7 text-xs bg-secondary border-panel-border mt-1 font-mono" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Code Preview ────────────────────────────────────────────────────────────

const CodePreview: React.FC = () => {
  const { components } = useCanvasStore();
  const code = useMemo(() => {
    const comps = Object.values(components).sort((a, b) => a.zIndex - b.zIndex);
    if (comps.length === 0) return '// No components on canvas\n// Drag components from the library to get started';
    let jsx = 'export default function Page() {\n  return (\n    <div className="relative">\n';
    comps.forEach((c) => {
      const style = `style={{ left: ${c.x}, top: ${c.y}, width: ${c.width}, height: ${c.height} }}`;
      switch (c.type) {
        case 'heading': jsx += `      <${c.props.level || 'h2'} className="absolute ${c.tailwindClasses}" ${style}>${c.props.text}</${c.props.level || 'h2'}>\n`; break;
        case 'paragraph': case 'text-block': jsx += `      <p className="absolute ${c.tailwindClasses}" ${style}>${c.props.text}</p>\n`; break;
        case 'button': jsx += `      <button className="absolute ${c.tailwindClasses}" ${style}>${c.props.text}</button>\n`; break;
        case 'image': jsx += `      <img src="${c.props.src}" alt="${c.props.alt}" className="absolute ${c.tailwindClasses}" ${style} />\n`; break;
        case 'card': jsx += `      <div className="absolute ${c.tailwindClasses}" ${style}>\n        <h3>${c.props.title}</h3>\n        <p>${c.props.description}</p>\n      </div>\n`; break;
        default: jsx += `      <div className="absolute ${c.tailwindClasses}" ${style}>{/* ${c.type} */}</div>\n`;
      }
    });
    jsx += '    </div>\n  );\n}';
    return jsx;
  }, [components]);

  const handleCopy = () => { navigator.clipboard.writeText(code); toast.success('Code copied to clipboard'); };

  return (
    <div className="flex-1 flex flex-col bg-canvas">
      <div className="flex items-center justify-between px-4 py-2 border-b border-panel-border">
        <span className="text-xs font-medium text-foreground">Generated Code</span>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 text-xs"><Copy className="w-3 h-3 mr-1" /> Copy</Button>
      </div>
      <pre className="flex-1 overflow-auto p-4 text-xs font-mono text-foreground/80 leading-relaxed"><code>{code}</code></pre>
    </div>
  );
};

// ─── Toolbar ─────────────────────────────────────────────────────────────────

const Toolbar: React.FC = () => {
  const { mode, setMode, devicePreview, setDevicePreview, toggleLeftPanel, toggleRightPanel } = useUIStore();
  const { transform, zoomTo, undo, redo, showGrid, setShowGrid } = useCanvasStore();
  const { saveToLocalStorage, project } = useProjectStore();
  const zoomPercent = Math.round(transform.scale * 100);

  return (
    <div className="h-10 bg-toolbar border-b border-panel-border flex items-center px-2 gap-1 select-none">
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleLeftPanel}><PanelLeftClose className="w-3.5 h-3.5" /></Button>
      <span className="text-xs font-medium text-foreground ml-1 mr-3 truncate max-w-[120px]">{project.name}</span>
      <div className="w-px h-5 bg-panel-border" />
      <div className="flex items-center bg-secondary rounded-md p-0.5 mx-1">
        {([
          { id: 'canvas' as const, icon: MousePointer2, label: 'Canvas' },
          { id: 'sitemap' as const, icon: Map, label: 'Sitemap' },
          { id: 'code' as const, icon: Code, label: 'Code' },
        ]).map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setMode(id)} className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${mode === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <Icon className="w-3 h-3" /><span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
      <div className="w-px h-5 bg-panel-border" />
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={undo} title="Undo (Ctrl+Z)"><Undo2 className="w-3.5 h-3.5" /></Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={redo} title="Redo (Ctrl+Shift+Z)"><Redo2 className="w-3.5 h-3.5" /></Button>
      <div className="flex-1" />
      <div className="flex items-center gap-0.5 mr-2">
        {([
          { id: 'desktop' as const, icon: Monitor },
          { id: 'tablet' as const, icon: Tablet },
          { id: 'mobile' as const, icon: Smartphone },
        ]).map(({ id, icon: Icon }) => (
          <button key={id} onClick={() => setDevicePreview(id)} className={`p-1 rounded transition-colors ${devicePreview === id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>
      <div className="w-px h-5 bg-panel-border" />
      <div className="flex items-center gap-1 mx-1">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => zoomTo(transform.scale - 0.1)}><ZoomOut className="w-3 h-3" /></Button>
        <span className="text-[10px] text-muted-foreground w-8 text-center font-mono">{zoomPercent}%</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => zoomTo(transform.scale + 0.1)}><ZoomIn className="w-3 h-3" /></Button>
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowGrid(!showGrid)} title="Toggle Grid">
        <Grid3X3 className={`w-3.5 h-3.5 ${showGrid ? 'text-primary' : ''}`} />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={saveToLocalStorage} title="Save"><Save className="w-3.5 h-3.5" /></Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleRightPanel}><PanelRightClose className="w-3.5 h-3.5" /></Button>
    </div>
  );
};

// ─── Builder Layout ──────────────────────────────────────────────────────────

const BuilderLayout: React.FC = () => {
  const { mode, leftPanelOpen, rightPanelOpen } = useUIStore();
  const { loadFromLocalStorage } = useProjectStore();

  useEffect(() => { loadFromLocalStorage(); }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        {leftPanelOpen && (
          <div className="w-56 border-r border-panel-border flex-shrink-0 overflow-hidden">
            <ComponentLibrary />
          </div>
        )}
        {mode === 'canvas' && <Canvas />}
        {mode === 'sitemap' && <SitemapView />}
        {mode === 'code' && <CodePreview />}
        {rightPanelOpen && mode === 'canvas' && (
          <div className="w-60 border-l border-panel-border flex-shrink-0 overflow-hidden">
            <PropertiesPanel />
          </div>
        )}
      </div>
    </div>
  );
};

// ─── App ─────────────────────────────────────────────────────────────────────

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <div className="h-screen">
      <BuilderLayout />
    </div>
  </TooltipProvider>
);

export default App;
