import { Link } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Grid3x3, MapPin, Code2, Eye } from 'lucide-react';

interface TopToolbarProps {
  projectName: string;
}

const TopToolbar = ({ projectName }: TopToolbarProps) => {
  const editorMode = useUIStore((state) => state.editorMode);
  const setEditorMode = useUIStore((state) => state.setEditorMode);
  const isPreviewMode = useUIStore((state) => state.isPreviewMode);
  const setPreviewMode = useUIStore((state) => state.setPreviewMode);

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between h-14 px-lg gap-lg">
        {/* Left: Navigation */}
        <div className="flex items-center gap-lg min-w-0">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>

          <div className="h-6 w-px bg-border" />

          <h1 className="text-sm font-semibold text-foreground truncate">{projectName}</h1>
        </div>

        {/* Center: Mode Switcher */}
        <div className="flex items-center gap-xs bg-secondary rounded-lg p-xs">
          <button
            onClick={() => setEditorMode('canvas')}
            className={`flex items-center gap-2 px-md py-xs rounded-md text-sm font-medium transition-smooth ${
              editorMode === 'canvas'
                ? 'bg-card text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Canvas editor"
          >
            <Grid3x3 className="w-4 h-4" />
            <span className="hidden sm:inline">Canvas</span>
          </button>

          <button
            onClick={() => setEditorMode('sitemap')}
            className={`flex items-center gap-2 px-md py-xs rounded-md text-sm font-medium transition-smooth ${
              editorMode === 'sitemap'
                ? 'bg-card text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Sitemap planner"
          >
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Sitemap</span>
          </button>

          <button
            onClick={() => setEditorMode('code-preview')}
            className={`flex items-center gap-2 px-md py-xs rounded-md text-sm font-medium transition-smooth ${
              editorMode === 'code-preview'
                ? 'bg-card text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Code preview and export"
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden sm:inline">Code</span>
          </button>
        </div>

        {/* Right: Preview Toggle */}
        <div className="flex items-center gap-sm">
          {editorMode === 'canvas' && (
            <Button
              variant={isPreviewMode ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode(!isPreviewMode)}
              className={isPreviewMode ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : ''}
            >
              <Eye className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{isPreviewMode ? 'Exit Preview' : 'Preview'}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopToolbar;
