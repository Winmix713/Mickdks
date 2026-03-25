import { useState } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useCanvasStore } from '../../stores/canvasStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Layout,
  Type,
  Navigation,
  Image,
  ToggleRight,
  Layers,
  Eye,
  Lock,
} from 'lucide-react';

const COMPONENT_LIBRARY = [
  {
    category: 'Layout',
    icon: Layout,
    components: [
      { id: 'section', name: 'Section', icon: '📦' },
      { id: 'container', name: 'Container', icon: '🎯' },
      { id: 'grid-2', name: 'Grid (2 col)', icon: '⬜' },
      { id: 'grid-3', name: 'Grid (3 col)', icon: '⬜' },
      { id: 'flex-row', name: 'Flex Row', icon: '↔️' },
    ],
  },
  {
    category: 'Typography',
    icon: Type,
    components: [
      { id: 'h1', name: 'Heading H1', icon: 'H' },
      { id: 'h2', name: 'Heading H2', icon: 'H' },
      { id: 'paragraph', name: 'Paragraph', icon: '¶' },
      { id: 'text', name: 'Text', icon: '📄' },
    ],
  },
  {
    category: 'Navigation',
    icon: Navigation,
    components: [
      { id: 'navbar', name: 'Navbar', icon: '🧭' },
      { id: 'footer', name: 'Footer', icon: '🔚' },
    ],
  },
  {
    category: 'Media',
    icon: Image,
    components: [
      { id: 'image', name: 'Image', icon: '🖼️' },
      { id: 'icon', name: 'Icon', icon: '⭐' },
    ],
  },
  {
    category: 'Interactive',
    icon: ToggleRight,
    components: [
      { id: 'button', name: 'Button', icon: '🔘' },
      { id: 'link', name: 'Link', icon: '🔗' },
      { id: 'card', name: 'Card', icon: '📇' },
    ],
  },
  {
    category: 'Form',
    icon: Type,
    components: [
      { id: 'input', name: 'Input', icon: '⌨️' },
      { id: 'textarea', name: 'Textarea', icon: '📝' },
      { id: 'select', name: 'Select', icon: '📋' },
    ],
  },
];

const LeftSidebar = () => {
  const activePanel = useUIStore((state) => state.activePanel);
  const setActivePanel = useUIStore((state) => state.setActivePanel);
  const addComponent = useCanvasStore((state) => state.addComponent);
  const components = useCanvasStore((state) => state.getComponents());
  const selectedIds = useCanvasStore((state) => state.selectedIds);
  const updateComponent = useCanvasStore((state) => state.updateComponent);

  const handleDragStart = (e: React.DragEvent, component: any) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('componentType', component.id);
  };

  const handleDeleteComponent = (id: string) => {
    useCanvasStore.setState((state) => {
      const newComponents = new Map(state.components);
      newComponents.delete(id);
      return { components: newComponents, selectedIds: new Set() };
    });
  };

  const handleToggleVisibility = (id: string) => {
    const component = components.find((c) => c.id === id);
    if (component) {
      updateComponent(id, { visible: !component.visible });
    }
  };

  const handleToggleLock = (id: string) => {
    const component = components.find((c) => c.id === id);
    if (component) {
      updateComponent(id, { locked: !component.locked });
    }
  };

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col overflow-hidden">
      <Tabs
        value={activePanel === 'none' ? 'components' : activePanel}
        onValueChange={(value) => setActivePanel(value as any)}
        className="flex-1 flex flex-col"
      >
        <TabsList className="w-full rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="components"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent"
          >
            Components
          </TabsTrigger>
          <TabsTrigger
            value="layers"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent"
          >
            Layers
          </TabsTrigger>
        </TabsList>

        {/* Components Library Tab */}
        <TabsContent value="components" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-sm space-y-lg">
              {COMPONENT_LIBRARY.map((category) => (
                <div key={category.category}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-xs px-sm">
                    {category.category}
                  </h3>
                  <div className="space-y-xs">
                    {category.components.map((comp) => (
                      <div
                        key={comp.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, comp)}
                        className="flex items-center gap-sm p-xs px-sm rounded-md bg-secondary/50 hover:bg-secondary cursor-move transition-smooth hover:shadow-md"
                        title={comp.name}
                      >
                        <span className="text-base">{comp.icon}</span>
                        <span className="text-sm text-foreground flex-1 truncate">{comp.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Layers Tab */}
        <TabsContent value="layers" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-sm space-y-xs">
              {components.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2xl">
                  No components on canvas yet
                </p>
              ) : (
                components.map((component) => (
                  <div
                    key={component.id}
                    className={`flex items-center gap-xs p-xs rounded-md transition-smooth cursor-pointer ${
                      selectedIds.has(component.id)
                        ? 'bg-indigo-500/20 border border-indigo-500'
                        : 'bg-secondary/30 hover:bg-secondary/60 border border-transparent'
                    }`}
                    onClick={() => {
                      useCanvasStore.setState({ selectedIds: new Set([component.id]) });
                    }}
                  >
                    <span className="text-xs text-muted-foreground flex-1 truncate">
                      {component.label}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisibility(component.id);
                      }}
                      className="p-xs hover:bg-secondary rounded transition-smooth"
                      title={component.visible ? 'Hide' : 'Show'}
                    >
                      <Eye className={`w-3 h-3 ${!component.visible ? 'opacity-30' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLock(component.id);
                      }}
                      className="p-xs hover:bg-secondary rounded transition-smooth"
                      title={component.locked ? 'Unlock' : 'Lock'}
                    >
                      <Lock className={`w-3 h-3 ${!component.locked ? 'opacity-30' : ''}`} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeftSidebar;
