import { useCanvasStore } from '../../stores/canvasStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';

const RightSidebar = () => {
  const selectedIds = useCanvasStore((state) => state.selectedIds);
  const getSelectedComponents = useCanvasStore((state) => state.getSelectedComponents);
  const updateComponent = useCanvasStore((state) => state.updateComponent);

  const selectedComponents = getSelectedComponents();
  const isMultiSelect = selectedIds.size > 1;
  const selectedComponent = selectedComponents[0];

  if (!selectedComponent) {
    return (
      <div className="w-80 border-l border-border bg-card flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Select a component to edit properties</p>
        </div>
      </div>
    );
  }

  const handlePropertyChange = (property: string, value: any) => {
    selectedComponents.forEach((comp) => {
      updateComponent(comp.id, { [property]: value });
    });
  };

  const handlePropsChange = (key: string, value: any) => {
    selectedComponents.forEach((comp) => {
      updateComponent(comp.id, {
        props: { ...comp.props, [key]: value },
      });
    });
  };

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col overflow-hidden">
      <div className="px-lg py-md border-b border-border">
        <h3 className="font-semibold text-foreground text-sm">Properties</h3>
        {isMultiSelect && (
          <p className="text-xs text-muted-foreground mt-1">{selectedIds.size} components selected</p>
        )}
      </div>

      <Tabs defaultValue="layout" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="layout"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent text-xs"
          >
            Layout
          </TabsTrigger>
          <TabsTrigger
            value="style"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent text-xs"
          >
            Style
          </TabsTrigger>
          <TabsTrigger
            value="advanced"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent text-xs"
          >
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* Layout Tab */}
        <TabsContent value="layout" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-lg space-y-lg">
              <div className="space-y-2">
                <Label htmlFor="x" className="text-xs">
                  X Position
                </Label>
                <Input
                  id="x"
                  type="number"
                  value={selectedComponent.x}
                  onChange={(e) => handlePropertyChange('x', parseFloat(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="y" className="text-xs">
                  Y Position
                </Label>
                <Input
                  id="y"
                  type="number"
                  value={selectedComponent.y}
                  onChange={(e) => handlePropertyChange('y', parseFloat(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="width" className="text-xs">
                  Width
                </Label>
                <Input
                  id="width"
                  type="number"
                  value={selectedComponent.width}
                  onChange={(e) => handlePropertyChange('width', parseFloat(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height" className="text-xs">
                  Height
                </Label>
                <Input
                  id="height"
                  type="number"
                  value={selectedComponent.height}
                  onChange={(e) => handlePropertyChange('height', parseFloat(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zindex" className="text-xs">
                  Z Index
                </Label>
                <Input
                  id="zindex"
                  type="number"
                  value={selectedComponent.zIndex}
                  onChange={(e) => handlePropertyChange('zIndex', parseInt(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-lg space-y-lg">
              <div className="space-y-2">
                <Label htmlFor="text" className="text-xs">
                  Text Content
                </Label>
                <Input
                  id="text"
                  type="text"
                  value={selectedComponent.props.text || ''}
                  onChange={(e) => handlePropsChange('text', e.target.value)}
                  className="h-8 text-sm"
                  placeholder="Enter text..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bgColor" className="text-xs">
                  Background Color
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="bgColor"
                    type="color"
                    value={selectedComponent.props.backgroundColor || '#1f2937'}
                    onChange={(e) => handlePropsChange('backgroundColor', e.target.value)}
                    className="h-8 w-12 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={selectedComponent.props.backgroundColor || '#1f2937'}
                    onChange={(e) => handlePropsChange('backgroundColor', e.target.value)}
                    className="h-8 text-sm flex-1"
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="textColor" className="text-xs">
                  Text Color
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={selectedComponent.props.textColor || '#f5f5f5'}
                    onChange={(e) => handlePropsChange('textColor', e.target.value)}
                    className="h-8 w-12 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={selectedComponent.props.textColor || '#f5f5f5'}
                    onChange={(e) => handlePropsChange('textColor', e.target.value)}
                    className="h-8 text-sm flex-1"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="opacity" className="text-xs">
                  Opacity
                </Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="opacity"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[selectedComponent.props.opacity || 1]}
                    onValueChange={([value]) => handlePropsChange('opacity', value)}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {Math.round((selectedComponent.props.opacity || 1) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-lg space-y-lg">
              <div className="space-y-2">
                <Label htmlFor="tailwind" className="text-xs">
                  Custom Classes
                </Label>
                <textarea
                  id="tailwind"
                  value={selectedComponent.props.customClasses || ''}
                  onChange={(e) => handlePropsChange('customClasses', e.target.value)}
                  className="w-full min-h-20 p-2 rounded-md bg-secondary border border-border text-xs text-foreground resize-none"
                  placeholder="Add custom Tailwind classes..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Component Type</Label>
                <p className="text-xs text-muted-foreground font-mono bg-secondary p-2 rounded">
                  {selectedComponent.type}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Component ID</Label>
                <p className="text-xs text-muted-foreground font-mono bg-secondary p-2 rounded break-all">
                  {selectedComponent.id}
                </p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RightSidebar;
