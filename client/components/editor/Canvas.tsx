import { useRef, useEffect, useState } from 'react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useUIStore } from '../../stores/uiStore';
import CanvasComponent from './CanvasComponent';
import Sitemap from './Sitemap';

const Canvas = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const zoom = useCanvasStore((state) => state.zoom);
  const panX = useCanvasStore((state) => state.panX);
  const panY = useCanvasStore((state) => state.panY);
  const setZoom = useCanvasStore((state) => state.setZoom);
  const setPan = useCanvasStore((state) => state.setPan);
  const components = useCanvasStore((state) => state.getComponents);
  const deleteComponent = useCanvasStore((state) => state.deleteComponent);
  const deselectAll = useCanvasStore((state) => state.deselectAll);
  const selectedIds = useCanvasStore((state) => state.selectedIds);
  const addComponent = useCanvasStore((state) => state.addComponent);

  const editorMode = useUIStore((state) => state.editorMode);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.ctrlKey || e.metaKey;

      // Delete selected components
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        selectedIds.forEach((id) => deleteComponent(id));
      }

      // Ctrl+D - Duplicate selected components
      if (isMeta && e.key === 'd') {
        e.preventDefault();
        const selected = Array.from(selectedIds);
        selected.forEach((id) => {
          const component = components().find((c) => c.id === id);
          if (component) {
            const newId = `comp-${Date.now()}-${Math.random()}`;
            addComponent({
              ...component,
              id: newId,
              x: component.x + 20,
              y: component.y + 20,
            });
          }
        });
      }

      // Ctrl+A - Select all
      if (isMeta && e.key === 'a') {
        e.preventDefault();
        useCanvasStore.setState({
          selectedIds: new Set(components().map((c) => c.id)),
        });
      }

      // Escape - Deselect all
      if (e.key === 'Escape') {
        deselectAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, deleteComponent, addComponent, components, deselectAll]);

  // Handle zoom with scroll wheel
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!canvasRef.current?.contains(e.target as Node)) return;
      if (!e.ctrlKey && !e.metaKey) return;

      e.preventDefault();

      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = zoom * delta;
      setZoom(newZoom);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [zoom, setZoom]);

  // Handle panning with middle mouse button or space+drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      // Middle button or shift+left drag for panning
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
    } else if (e.button === 0 && editorMode === 'canvas') {
      // Left click - deselect if clicking on empty canvas
      if (e.target === canvasRef.current) {
        deselectAll();
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPan(newX, newY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle component drop from library
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('componentType');
    if (!componentType) return;

    // Calculate drop position relative to canvas
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - panX) / zoom;
    const y = (e.clientY - rect.top - panY) / zoom;

    // Snap to grid (8px)
    const snapGrid = 8;
    const snappedX = Math.round(x / snapGrid) * snapGrid;
    const snappedY = Math.round(y / snapGrid) * snapGrid;

    // Create new component
    const componentId = `comp-${Date.now()}`;
    const newComponent = {
      id: componentId,
      type: componentType,
      label: componentType.charAt(0).toUpperCase() + componentType.slice(1),
      x: snappedX,
      y: snappedY,
      width: 200,
      height: 100,
      zIndex: components().length,
      visible: true,
      locked: false,
      props: {
        text: 'Component',
        backgroundColor: '#1f2937',
        textColor: '#f5f5f5',
      },
      children: [],
    };

    addComponent(newComponent);
    useCanvasStore.setState({ selectedIds: new Set([componentId]) });
  };

  if (editorMode === 'sitemap') {
    return <Sitemap />;
  }

  if (editorMode === 'code-preview') {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Code preview coming soon</p>
        </div>
      </div>
    );
  }

  // Calculate ruler marks
  const generateRulerMarks = (size: number, step: number = 50) => {
    const marks = [];
    for (let i = 0; i < size; i += step) {
      marks.push(i);
    }
    return marks;
  };

  const rulerSize = 40;
  const rulerMarks = generateRulerMarks(2000);

  return (
    <div className="flex-1 relative overflow-hidden bg-background">
      {/* Top Ruler */}
      <div className="absolute top-0 left-10 right-0 h-10 bg-card border-b border-border pointer-events-none">
        <div
          style={{
            transform: `translateX(${panX}px) scaleX(${zoom})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
            display: 'flex',
          }}
        >
          {rulerMarks.map((mark) => (
            <div
              key={`h-${mark}`}
              style={{
                position: 'absolute',
                left: mark,
                width: 50,
              }}
            >
              <div className="h-2 border-l border-border" />
              <div className="text-xs text-muted-foreground pl-1">{mark}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Left Ruler */}
      <div className="absolute top-10 left-0 bottom-0 w-10 bg-card border-r border-border pointer-events-none">
        <div
          style={{
            transform: `translateY(${panY}px) scaleY(${zoom})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {rulerMarks.map((mark) => (
            <div
              key={`v-${mark}`}
              style={{
                position: 'absolute',
                top: mark,
                height: 50,
              }}
            >
              <div className="w-2 border-t border-border" />
              <div className="text-xs text-muted-foreground whitespace-nowrap -rotate-90 origin-top-left" style={{ marginLeft: 4, marginTop: -8 }}>
                {mark}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={canvasRef}
        className="absolute top-10 left-10 right-0 bottom-0 bg-background relative overflow-hidden canvas-background"
        style={{
          backgroundPosition: `${panX}px ${panY}px`,
          backgroundSize: `${16 * zoom}px ${16 * zoom}px`,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Canvas content */}
        <div
          ref={contentRef}
          style={{
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
          }}
          className="transition-none"
        >
          {components().map((component) => (
            <CanvasComponent key={component.id} component={component} />
          ))}
        </div>

        {/* Zoom indicator */}
        <div className="absolute bottom-sm right-sm bg-card border border-border rounded px-md py-xs text-xs text-muted-foreground pointer-events-none">
          {Math.round(zoom * 100)}%
        </div>
      </div>
    </div>
  );
};

export default Canvas;
