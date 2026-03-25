import { useCanvasStore } from '../../stores/canvasStore';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Redo2, Undo2 } from 'lucide-react';

const StatusBar = () => {
  const zoom = useCanvasStore((state) => state.zoom);
  const setZoom = useCanvasStore((state) => state.setZoom);
  const selectedIds = useCanvasStore((state) => state.selectedIds);

  const handleZoomIn = () => setZoom(zoom * 1.2);
  const handleZoomOut = () => setZoom(zoom / 1.2);
  const handleResetZoom = () => setZoom(1);
  const handleZoomToFit = () => setZoom(0.8);

  return (
    <div className="h-10 border-t border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-lg text-xs">
      {/* Left: Selection Info */}
      <div className="text-muted-foreground">
        {selectedIds.size === 0 ? (
          <span>No selection</span>
        ) : (
          <span>{selectedIds.size} component{selectedIds.size !== 1 ? 's' : ''} selected</span>
        )}
      </div>

      {/* Center: Undo/Redo */}
      <div className="flex items-center gap-xs">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Right: Zoom Controls */}
      <div className="flex items-center gap-xs">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs"
          onClick={handleZoomOut}
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-1 px-2 py-1 bg-secondary rounded text-xs text-muted-foreground min-w-12">
          <span className="cursor-pointer hover:text-foreground" onClick={handleResetZoom} title="Reset zoom">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs"
          onClick={handleZoomIn}
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>

        <div className="h-4 w-px bg-border" />

        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs"
          onClick={handleZoomToFit}
          title="Zoom to fit (80%)"
        >
          Fit
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs"
          onClick={handleResetZoom}
          title="Reset zoom (100%)"
        >
          100%
        </Button>
      </div>
    </div>
  );
};

export default StatusBar;
