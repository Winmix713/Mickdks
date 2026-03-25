import { useState } from 'react';
import { useCanvasStore, type CanvasComponent as ICanvasComponent } from '../../stores/canvasStore';
import ComponentRenderer from './ComponentRenderer';

interface Props {
  component: ICanvasComponent;
}

const CanvasComponent = ({ component }: Props) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState<string>('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const selectedIds = useCanvasStore((state) => state.selectedIds);
  const selectComponent = useCanvasStore((state) => state.selectComponent);
  const updateComponent = useCanvasStore((state) => state.updateComponent);
  const zoom = useCanvasStore((state) => state.zoom);

  const isSelected = selectedIds.has(component.id);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (component.locked) return;
    if (isResizing) return;

    e.preventDefault();
    e.stopPropagation();

    const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
    selectComponent(component.id, isMultiSelect);

    setDragStart({
      x: e.clientX - component.x,
      y: e.clientY - component.y,
    });

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newX = moveEvent.clientX - dragStart.x;
      const newY = moveEvent.clientY - dragStart.y;

      // Snap to grid
      const snapGrid = 8;
      const snappedX = Math.round(newX / snapGrid) * snapGrid;
      const snappedY = Math.round(newY / snapGrid) * snapGrid;

      updateComponent(component.id, { x: snappedX, y: snappedY });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeStart = (e: React.MouseEvent, dir: string) => {
    if (component.locked) return;

    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDir(dir);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = component.width;
    const startHeight = component.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startX) / zoom;
      const deltaY = (moveEvent.clientY - startY) / zoom;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = component.x;
      let newY = component.y;

      // Calculate new dimensions based on resize direction
      if (dir.includes('e')) newWidth = startWidth + deltaX;
      if (dir.includes('w')) {
        newWidth = startWidth - deltaX;
        newX = component.x + deltaX;
      }
      if (dir.includes('s')) newHeight = startHeight + deltaY;
      if (dir.includes('n')) {
        newHeight = startHeight - deltaY;
        newY = component.y + deltaY;
      }

      // Minimum size
      newWidth = Math.max(40, newWidth);
      newHeight = Math.max(40, newHeight);

      updateComponent(component.id, {
        width: newWidth,
        height: newHeight,
        x: newX,
        y: newY,
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (!component.visible) {
    return null;
  }

  const resizeHandles = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];
  const cursorMap: Record<string, string> = {
    nw: 'nwse-resize',
    n: 'ns-resize',
    ne: 'nesw-resize',
    w: 'ew-resize',
    e: 'ew-resize',
    sw: 'nesw-resize',
    s: 'ns-resize',
    se: 'nwse-resize',
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: component.x,
        top: component.y,
        width: component.width,
        height: component.height,
        zIndex: component.zIndex,
        userSelect: 'none',
      }}
      onClick={handleMouseDown}
      onMouseDown={handleMouseDown}
      className={`transition-none ${isSelected ? 'cursor-move' : 'cursor-default'}`}
    >
      {/* Selection Border */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-indigo-500 rounded-lg pointer-events-none shadow-lg shadow-indigo-500/20" />
      )}

      {/* Component Content */}
      <div className="w-full h-full overflow-hidden">
        <ComponentRenderer component={component} />
      </div>

      {/* Selection Label */}
      {isSelected && (
        <div className="absolute -top-6 left-0 px-xs py-xs bg-indigo-500 text-white text-xs rounded-sm whitespace-nowrap pointer-events-none font-medium">
          {component.label}
        </div>
      )}

      {/* Resize Handles */}
      {isSelected && !component.locked && (
        <>
          {resizeHandles.map((dir) => (
            <div
              key={dir}
              onMouseDown={(e) => handleResizeStart(e, dir)}
              style={{
                position: 'absolute',
                ...(dir.includes('n') ? { top: -4 } : {}),
                ...(dir.includes('s') ? { bottom: -4 } : {}),
                ...(dir.includes('w') ? { left: -4 } : {}),
                ...(dir.includes('e') ? { right: -4 } : {}),
                ...(dir === 'n' || dir === 's' ? { left: '50%', marginLeft: -4, width: 8 } : {}),
                ...(dir === 'w' || dir === 'e' ? { top: '50%', marginTop: -4, height: 8 } : {}),
                ...(dir === 'nw' || dir === 'ne' || dir === 'sw' || dir === 'se'
                  ? { width: 8, height: 8 }
                  : {}),
              }}
              className="bg-indigo-500 rounded-full transition-opacity hover:opacity-100 opacity-70 cursor-pointer"
            />
          ))}
        </>
      )}
    </div>
  );
};

export default CanvasComponent;
