import { useState } from 'react';
import { useProjectStore, type Page } from '../../stores/projectStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

const Sitemap = () => {
  const currentProject = useProjectStore((state) => state.currentProject);
  const currentPageId = useProjectStore((state) => state.currentPageId);
  const setCurrentPage = useProjectStore((state) => state.setCurrentPage);
  const createPage = useProjectStore((state) => state.createPage);
  const deletePage = useProjectStore((state) => state.deletePage);
  const updatePage = useProjectStore((state) => state.updatePage);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-muted-foreground">
        <p>No project loaded</p>
      </div>
    );
  }

  const handleCreatePage = () => {
    const newName = `Page ${currentProject.pages.length + 1}`;
    createPage(newName);
  };

  const handleStartEdit = (page: Page) => {
    setEditingId(page.id);
    setEditingName(page.name);
  };

  const handleSaveEdit = (pageId: string) => {
    if (editingName.trim()) {
      updatePage(pageId, { name: editingName });
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDeletePage = (pageId: string) => {
    if (currentProject.pages.length > 1) {
      deletePage(pageId);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card p-lg">
        <h2 className="text-lg font-semibold text-foreground mb-md">Pages</h2>
        <Button
          onClick={handleCreatePage}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Page
        </Button>
      </div>

      {/* Pages List */}
      <ScrollArea className="flex-1">
        <div className="p-lg space-y-xs">
          {currentProject.pages.map((page) => (
            <div
              key={page.id}
              className={`border rounded-lg transition-smooth ${
                currentPageId === page.id
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-border bg-card/50 hover:bg-card'
              }`}
            >
              {editingId === page.id ? (
                // Edit Mode
                <div className="p-md space-y-md">
                  <Input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="bg-background border-border"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(page.id);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <div className="flex gap-xs">
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(page.id)}
                      className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div
                  onClick={() => setCurrentPage(page.id)}
                  className="p-md cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-xs">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{page.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {page.componentIds.length} components
                      </p>
                    </div>
                    <div className="flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(page);
                        }}
                        className="p-xs text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit page"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {currentProject.pages.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePage(page.id);
                          }}
                          className="p-xs text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete page"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Page Details */}
                  <div className="text-xs text-muted-foreground space-y-1 mt-md">
                    <div className="flex justify-between">
                      <span>Slug:</span>
                      <code className="text-foreground">{page.slug}</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Title:</span>
                      <code className="text-foreground text-xs">{page.title || 'Untitled'}</code>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      <div className="border-t border-border bg-card/50 p-lg text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Total Pages:</span>
          <span className="font-semibold">{currentProject.pages.length}</span>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
