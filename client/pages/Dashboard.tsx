import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjectStore } from '../stores/projectStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Clock, Settings } from 'lucide-react';

const Dashboard = () => {
  const [projects, setProjects] = useState<any[]>(() => {
    const stored = localStorage.getItem('projects');
    return stored ? JSON.parse(stored) : [];
  });
  const [newProjectName, setNewProjectName] = useState('');
  const createProject = useProjectStore((state) => state.createProject);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    const project = createProject(newProjectName);
    const updatedProjects = [...projects, project];
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    setNewProjectName('');
  };

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter((p) => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  };

  const handleOpenProject = (project: any) => {
    localStorage.setItem('currentProject', JSON.stringify(project));
    useProjectStore.setState({ currentProject: project, currentPageId: project.pages[0]?.id });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-lg py-lg flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Visual Builder</h1>
            <p className="text-sm text-muted-foreground mt-1">Create and manage your design projects</p>
          </div>
          <Settings className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer transition-smooth" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-lg py-2xl">
        {/* Create New Project */}
        <div className="mb-2xl">
          <h2 className="text-lg font-semibold text-foreground mb-md">New Project</h2>
          <div className="flex gap-sm">
            <Input
              type="text"
              placeholder="Project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateProject();
              }}
              className="flex-1 bg-card border-border"
            />
            <Button
              onClick={handleCreateProject}
              disabled={!newProjectName.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-2xl">
            <div className="inline-block p-2xl bg-card rounded-lg border border-border mb-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 rounded-lg flex items-center justify-center">
                <Plus className="w-8 h-8 text-indigo-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No projects yet</h3>
            <p className="text-muted-foreground">Create your first project to get started with the visual builder</p>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-md">Recent Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group relative bg-card border border-border rounded-lg overflow-hidden hover:border-indigo-500/50 transition-smooth hover:shadow-lg hover:shadow-indigo-500/10"
                >
                  {/* Project Card Background */}
                  <div className="aspect-video bg-gradient-to-br from-indigo-500/10 via-background to-background relative overflow-hidden">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-smooth bg-gradient-to-br from-indigo-500/5 to-transparent" />
                    <div className="absolute top-sm right-sm w-8 h-8 bg-indigo-500/20 rounded-lg" />
                    <div className="absolute bottom-sm left-sm w-6 h-6 bg-indigo-500/10 rounded-full" />
                  </div>

                  {/* Project Content */}
                  <div className="p-lg">
                    <h3 className="font-semibold text-foreground group-hover:text-indigo-400 transition-smooth truncate">
                      {project.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-xs">
                      <Clock className="w-3 h-3" />
                      {formatDate(project.updatedAt)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {project.pages?.length || 0} pages
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-lg pb-lg flex gap-sm opacity-0 group-hover:opacity-100 transition-smooth">
                    <Link
                      to={`/editor/${project.id}`}
                      onClick={() => handleOpenProject(project)}
                      className="flex-1"
                    >
                      <Button
                        size="sm"
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
                      >
                        Open
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-smooth"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
