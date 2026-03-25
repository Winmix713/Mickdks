import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useUIStore } from '../stores/uiStore';
import { useCanvasStore } from '../stores/canvasStore';
import TopToolbar from '../components/editor/TopToolbar';
import Canvas from '../components/editor/Canvas';
import LeftSidebar from '../components/editor/LeftSidebar';
import RightSidebar from '../components/editor/RightSidebar';
import StatusBar from '../components/editor/StatusBar';

const Editor = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const currentProject = useProjectStore((state) => state.currentProject);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const leftPanelOpen = useUIStore((state) => state.leftPanelOpen);
  const rightPanelOpen = useUIStore((state) => state.rightPanelOpen);

  useEffect(() => {
    // Load project from localStorage or redirect
    if (!projectId) {
      navigate('/');
      return;
    }

    if (!currentProject) {
      const stored = localStorage.getItem('currentProject');
      if (stored) {
        try {
          const project = JSON.parse(stored);
          setCurrentProject(project);
        } catch (e) {
          navigate('/');
        }
      } else {
        navigate('/');
      }
    }
  }, [projectId, currentProject, setCurrentProject, navigate]);

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top Toolbar */}
      <TopToolbar projectName={currentProject.name} />

      {/* Main Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Component Library */}
        {leftPanelOpen && <LeftSidebar />}

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Canvas />
          
          {/* Status Bar */}
          <StatusBar />
        </div>

        {/* Right Sidebar - Properties Panel */}
        {rightPanelOpen && <RightSidebar />}
      </div>
    </div>
  );
};

export default Editor;
