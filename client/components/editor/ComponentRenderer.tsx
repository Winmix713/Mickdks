import { type CanvasComponent } from '../../stores/canvasStore';

interface ComponentRendererProps {
  component: CanvasComponent;
}

const ComponentRenderer = ({ component }: ComponentRendererProps) => {
  const baseStyles = {
    width: '100%',
    height: '100%',
    borderRadius: '6px',
    backgroundColor: component.props.backgroundColor || '#1f2937',
    color: component.props.textColor || '#f5f5f5',
    opacity: component.props.opacity || 1,
    fontSize: component.props.fontSize ? `${component.props.fontSize}px` : undefined,
    fontWeight: component.props.fontWeight || 400,
    padding: component.props.padding ? `${component.props.padding}px` : '12px',
  } as React.CSSProperties;

  const renderComponent = () => {
    switch (component.type) {
      // Layout Components
      case 'section':
        return (
          <div style={baseStyles} className="flex items-center justify-center border-2 border-dashed">
            <span className="text-center text-sm">Section</span>
          </div>
        );

      case 'container':
        return (
          <div style={baseStyles} className="flex items-center justify-center border-2 border-dashed">
            <span className="text-center text-sm">Container</span>
          </div>
        );

      case 'grid-2':
        return (
          <div style={{ ...baseStyles, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div className="bg-secondary/50 rounded border border-border" />
            <div className="bg-secondary/50 rounded border border-border" />
          </div>
        );

      case 'grid-3':
        return (
          <div style={{ ...baseStyles, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <div className="bg-secondary/50 rounded border border-border" />
            <div className="bg-secondary/50 rounded border border-border" />
            <div className="bg-secondary/50 rounded border border-border" />
          </div>
        );

      case 'flex-row':
        return (
          <div style={{ ...baseStyles, display: 'flex', gap: '8px' }}>
            <div className="flex-1 bg-secondary/50 rounded border border-border" />
            <div className="flex-1 bg-secondary/50 rounded border border-border" />
          </div>
        );

      // Typography Components
      case 'h1':
        return (
          <h1 style={baseStyles} className="text-4xl font-bold">
            {component.props.text || 'Heading H1'}
          </h1>
        );

      case 'h2':
        return (
          <h2 style={baseStyles} className="text-3xl font-bold">
            {component.props.text || 'Heading H2'}
          </h2>
        );

      case 'paragraph':
        return (
          <p style={baseStyles} className="text-base leading-relaxed">
            {component.props.text || 'Paragraph text goes here...'}
          </p>
        );

      case 'text':
        return (
          <span style={baseStyles} className="text-sm">
            {component.props.text || 'Text'}
          </span>
        );

      // Navigation Components
      case 'navbar':
        return (
          <nav style={baseStyles} className="flex items-center justify-between px-4">
            <div className="font-bold text-lg">Logo</div>
            <div className="flex gap-4">
              <div className="text-sm cursor-pointer hover:opacity-80">Home</div>
              <div className="text-sm cursor-pointer hover:opacity-80">About</div>
              <div className="text-sm cursor-pointer hover:opacity-80">Contact</div>
            </div>
          </nav>
        );

      case 'footer':
        return (
          <footer style={baseStyles} className="flex items-center justify-between px-4">
            <div className="text-sm opacity-80">© 2024 Your Company</div>
            <div className="flex gap-4 text-sm opacity-80">
              <div>Privacy</div>
              <div>Terms</div>
            </div>
          </footer>
        );

      // Media Components
      case 'image':
        return (
          <div style={baseStyles} className="flex items-center justify-center bg-secondary/50 border-2 border-dashed">
            <span className="text-sm text-muted-foreground">Image</span>
          </div>
        );

      case 'icon':
        return (
          <div style={baseStyles} className="flex items-center justify-center bg-secondary/50">
            <span className="text-2xl">⭐</span>
          </div>
        );

      // Interactive Components
      case 'button':
        return (
          <button
            style={{
              ...baseStyles,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            className="font-semibold hover:opacity-80 active:scale-95"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {component.props.text || 'Button'}
          </button>
        );

      case 'link':
        return (
          <a
            style={{ ...baseStyles, cursor: 'pointer', textDecoration: 'underline' }}
            className="text-indigo-500 hover:opacity-80"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {component.props.text || 'Link'}
          </a>
        );

      case 'card':
        return (
          <div
            style={{
              ...baseStyles,
              padding: '16px',
              border: `1px solid ${component.props.borderColor || '#3f3f46'}`,
            }}
            className="bg-card"
          >
            <div className="font-semibold mb-2">{component.props.title || 'Card Title'}</div>
            <div className="text-sm text-muted-foreground">{component.props.text || 'Card content'}</div>
          </div>
        );

      // Form Components
      case 'input':
        return (
          <input
            style={{
              ...baseStyles,
              border: `1px solid ${component.props.borderColor || '#3f3f46'}`,
              fontSize: '14px',
            }}
            type="text"
            placeholder={component.props.placeholder || 'Input...'}
            readOnly
            onMouseDown={(e) => e.stopPropagation()}
          />
        );

      case 'textarea':
        return (
          <textarea
            style={{
              ...baseStyles,
              border: `1px solid ${component.props.borderColor || '#3f3f46'}`,
              fontSize: '14px',
              resize: 'none',
              fontFamily: 'inherit',
            }}
            placeholder={component.props.placeholder || 'Textarea...'}
            readOnly
            onMouseDown={(e) => e.stopPropagation()}
          />
        );

      case 'select':
        return (
          <select
            style={{
              ...baseStyles,
              border: `1px solid ${component.props.borderColor || '#3f3f46'}`,
              fontSize: '14px',
              cursor: 'pointer',
            }}
            disabled
          >
            <option>{component.props.text || 'Select option'}</option>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        );

      // Data Components
      case 'badge':
        return (
          <span
            style={{
              ...baseStyles,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: '500',
            }}
          >
            {component.props.text || 'Badge'}
          </span>
        );

      case 'separator':
        return (
          <div
            style={{
              width: '100%',
              height: '1px',
              backgroundColor: component.props.borderColor || '#3f3f46',
            }}
          />
        );

      default:
        return (
          <div style={baseStyles} className="flex items-center justify-center border-2 border-dashed opacity-50">
            <span className="text-xs text-muted-foreground">{component.type}</span>
          </div>
        );
    }
  };

  return renderComponent();
};

export default ComponentRenderer;
