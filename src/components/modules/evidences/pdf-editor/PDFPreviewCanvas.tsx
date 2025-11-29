import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Circle, FabricImage, Line, Rect, Textbox } from 'fabric';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MousePointer2,
  Pencil,
  Type,
  ArrowRight,
  Square,
  Circle as CircleIcon,
  Trash2,
  Undo2,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Evidence } from '@/utils/evidence/pdfGenerator';
import { toast } from 'sonner';

interface PDFPreviewCanvasProps {
  evidence: Evidence;
  onAddAnnotation: (annotation: any) => void;
  annotations: any[];
}

type Tool = 'select' | 'draw' | 'text' | 'arrow' | 'rectangle' | 'circle';

export const PDFPreviewCanvas: React.FC<PDFPreviewCanvasProps> = ({
  evidence,
  onAddAnnotation,
  annotations
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [drawingColor, setDrawingColor] = useState('#FF0000');
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = new FabricCanvas(canvasRef.current, {
      width: container.clientWidth - 32,
      height: container.clientHeight - 32,
      backgroundColor: '#f5f5f5',
    });

    // Initialize drawing brush
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = drawingColor;
      canvas.freeDrawingBrush.width = 3;
    }

    setFabricCanvas(canvas);

    // Load image
    if (evidence.file_type.startsWith('image/')) {
      FabricImage.fromURL(evidence.file_url, {
        crossOrigin: 'anonymous'
      })
        .then((img) => {
          if (!img) return;
          
          // Scale image to fit canvas
          const scale = Math.min(
            (canvas.width || 800) / (img.width || 1),
            (canvas.height || 600) / (img.height || 1)
          ) * 0.9;
          
          img.scale(scale);
          img.set({
            left: ((canvas.width || 800) - (img.width || 0) * scale) / 2,
            top: ((canvas.height || 600) - (img.height || 0) * scale) / 2,
            selectable: false,
            evented: false,
          });
          
          canvas.add(img);
          // Move image to back using the correct v6 method
          const objects = canvas.getObjects();
          if (objects.length > 0) {
            canvas.moveObjectTo(img, 0);
          }
          canvas.renderAll();
        })
        .catch((err) => {
          console.error('Error cargando imagen de evidencia', err);
          toast.error('No se pudo cargar la imagen para la vista previa.');
        });
    }

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      canvas.setDimensions({
        width: containerRef.current.clientWidth - 32,
        height: containerRef.current.clientHeight - 32,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, [evidence]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === 'draw';
    
    if (activeTool === 'draw' && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = drawingColor;
      fabricCanvas.freeDrawingBrush.width = 3;
    }
  }, [activeTool, drawingColor, fabricCanvas]);

  const handleToolClick = (tool: Tool) => {
    if (!fabricCanvas) return;
    
    setActiveTool(tool);

    if (tool === 'rectangle') {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: drawingColor,
        strokeWidth: 3,
        width: 100,
        height: 100,
      });
      fabricCanvas.add(rect);
      onAddAnnotation({ type: 'rectangle', color: drawingColor });
    } else if (tool === 'circle') {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: drawingColor,
        strokeWidth: 3,
        radius: 50,
      });
      fabricCanvas.add(circle);
      onAddAnnotation({ type: 'circle', color: drawingColor });
    } else if (tool === 'arrow') {
      const line = new Line([50, 50, 200, 200], {
        stroke: drawingColor,
        strokeWidth: 3,
      });
      fabricCanvas.add(line);
      onAddAnnotation({ type: 'arrow', color: drawingColor });
      toast.success('Flecha agregada');
    } else if (tool === 'text') {
      const text = new Textbox('Escribe aquí...', {
        left: 100,
        top: 100,
        fontSize: 20,
        fill: drawingColor,
        fontFamily: 'Arial',
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
      onAddAnnotation({ type: 'text', color: drawingColor });
    }
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    const objects = fabricCanvas.getObjects();
    // Remove all objects except the background image
    objects.forEach((obj, index) => {
      if (index > 0) {
        fabricCanvas.remove(obj);
      }
    });
    toast.success('Anotaciones eliminadas');
  };

  const handleUndo = () => {
    if (!fabricCanvas) return;
    const objects = fabricCanvas.getObjects();
    if (objects.length > 1) {
      fabricCanvas.remove(objects[objects.length - 1]);
      toast.success('Acción deshecha');
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!fabricCanvas) return;
    const newZoom = direction === 'in' ? zoom * 1.1 : zoom / 1.1;
    if (newZoom >= 0.5 && newZoom <= 3) {
      setZoom(newZoom);
      fabricCanvas.setZoom(newZoom);
      toast.success(`Zoom: ${Math.round(newZoom * 100)}%`);
    }
  };

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Seleccionar' },
    { id: 'draw', icon: Pencil, label: 'Dibujar' },
    { id: 'text', icon: Type, label: 'Texto' },
    { id: 'arrow', icon: ArrowRight, label: 'Flecha' },
    { id: 'rectangle', icon: Square, label: 'Rectángulo' },
    { id: 'circle', icon: CircleIcon, label: 'Círculo' },
  ];

  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000', '#FFFFFF'];

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-3 border-b bg-card space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              size="sm"
              variant={activeTool === tool.id ? 'default' : 'outline'}
              onClick={() => handleToolClick(tool.id as Tool)}
              className="h-8"
            >
              <tool.icon className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{tool.label}</span>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded border-2 transition-all ${
                  drawingColor === color ? 'border-primary scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setDrawingColor(color)}
              />
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          <Button size="sm" variant="outline" onClick={handleUndo}>
            <Undo2 className="w-4 h-4" />
          </Button>

          <Button size="sm" variant="outline" onClick={handleClear}>
            <Trash2 className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button size="sm" variant="outline" onClick={() => handleZoom('out')}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs font-medium">{Math.round(zoom * 100)}%</span>
          <Button size="sm" variant="outline" onClick={() => handleZoom('in')}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Container */}
      <div ref={containerRef} className="flex-1 p-4 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <canvas ref={canvasRef} className="shadow-lg" />
        </div>
      </div>

      {/* Info */}
      <div className="p-3 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground">
          💡 Tip: Usa las herramientas para agregar anotaciones, flechas o texto sobre la imagen
        </p>
      </div>
    </div>
  );
};
