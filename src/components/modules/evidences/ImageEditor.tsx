import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Undo, 
  MousePointer, 
  Circle, 
  ArrowRight,
  Palette,
  Download,
  X,
  Loader2
} from 'lucide-react';
import { Canvas as FabricCanvas, Circle as FabricCircle, Line as FabricLine, FabricImage } from 'fabric';
import { useToast } from '@/hooks/use-toast';

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
  onSave: (editedImageBlob: Blob, fileName: string) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageName,
  onSave
}) => {
  // Debug logging al inicio
  console.log('🎨 ImageEditor: Props recibidas:');
  console.log('  - isOpen:', isOpen);
  console.log('  - imageUrl:', imageUrl);
  console.log('  - imageName:', imageName);
  console.log('  - imageUrl tipo:', typeof imageUrl);
  console.log('  - imageUrl longitud:', imageUrl?.length);
  console.log('  - imageUrl válida:', !!(imageUrl && imageUrl.length > 0));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'circle' | 'arrow' | 'draw'>('select');
  const [activeColor, setActiveColor] = useState('#FF0000');
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const { toast } = useToast();

  // Colores predefinidos
  const colors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#000000', '#FFFFFF'
  ];

  // Función para cargar imagen
  const loadImageToCanvas = useCallback(async (canvas: FabricCanvas, url: string) => {
    console.log('🎨 ImageEditor: Iniciando carga de imagen:', url);
    setLoadingImage(true);
    setImageLoaded(false);
    
    try {
      // Verificar que la URL sea válida
      if (!url || typeof url !== 'string') {
        throw new Error('URL de imagen inválida o undefined');
      }

      console.log('📡 ImageEditor: Verificando acceso a la imagen...');
      
      // Método 1: Intentar cargar directamente
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const imageLoadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => {
          console.log('✅ ImageEditor: Imagen cargada exitosamente:', img.width, 'x', img.height);
          resolve(img);
        };
        
        img.onerror = (error) => {
          console.warn('⚠️ ImageEditor: Error en carga directa, intentando con fetch...');
          reject(error);
        };
        
        // Timeout para evitar que se cuelgue
        setTimeout(() => {
          reject(new Error('Timeout loading image'));
        }, 10000);
      });

      img.src = url;
      let loadedImg: HTMLImageElement;

      try {
        loadedImg = await imageLoadPromise;
      } catch (directError) {
        console.log('🔄 ImageEditor: Intentando método alternativo con fetch...');
        
        // Método alternativo: fetch + blob
        const response = await fetch(url, { 
          mode: 'cors',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const blobImg = new Image();
        const blobLoadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
          blobImg.onload = () => {
            console.log('✅ ImageEditor: Imagen cargada con blob:', blobImg.width, 'x', blobImg.height);
            URL.revokeObjectURL(blobUrl); // Limpiar
            resolve(blobImg);
          };
          blobImg.onerror = reject;
        });
        
        blobImg.src = blobUrl;
        loadedImg = await blobLoadPromise;
      }

      // Limpiar canvas antes de agregar nueva imagen
      console.log('🧹 ImageEditor: Limpiando canvas...');
      canvas.clear();
      canvas.backgroundColor = '#ffffff';

      // Crear FabricImage usando el método correcto para v6
      console.log('🖼️ ImageEditor: Creando FabricImage...');
      
      // Usar FabricImage directamente con el elemento Image
      const fabricImg = new FabricImage(loadedImg, {
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
        name: 'background-image'
      });

      // Configurar posición y escala
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const imgWidth = loadedImg.width;
      const imgHeight = loadedImg.height;
      
      console.log('📐 ImageEditor: Dimensiones - Canvas:', canvasWidth, 'x', canvasHeight, 'Imagen:', imgWidth, 'x', imgHeight);
      
      const imgAspect = imgWidth / imgHeight;
      const canvasAspect = canvasWidth / canvasHeight;

      let renderWidth, renderHeight;
      if (imgAspect > canvasAspect) {
        renderWidth = canvasWidth * 0.9;
        renderHeight = renderWidth / imgAspect;
      } else {
        renderHeight = canvasHeight * 0.9;
        renderWidth = renderHeight * imgAspect;
      }

      fabricImg.set({
        left: (canvasWidth - renderWidth) / 2,
        top: (canvasHeight - renderHeight) / 2,
        scaleX: renderWidth / imgWidth,
        scaleY: renderHeight / imgHeight,
        selectable: false,
        evented: false,
        name: 'background-image'
      });

      // Agregar imagen al canvas
      console.log('➕ ImageEditor: Agregando imagen al canvas...');
      canvas.add(fabricImg);
      canvas.sendObjectToBack(fabricImg);
      canvas.renderAll();

      setImageLoaded(true);
      console.log('🎉 ImageEditor: Imagen cargada exitosamente en el canvas');
      
      toast({
        title: "Imagen cargada",
        description: "La imagen se cargó correctamente en el editor"
      });
    } catch (error) {
      console.error('💥 ImageEditor: Error cargando imagen:', error);
      
      // Mostrar canvas vacío pero funcional
      canvas.clear();
      canvas.backgroundColor = '#f8f9fa';
      canvas.renderAll();
      
      toast({
        title: "Error de carga",
        description: `No se pudo cargar la imagen. Puedes usar el editor para crear anotaciones.`,
        variant: "destructive"
      });
    } finally {
      setLoadingImage(false);
    }
  }, [toast]);

  // Inicialización del canvas
  useEffect(() => {
    console.log('🔄 ImageEditor: useEffect llamado con:', {
      isOpen,
      hasCanvasRef: !!canvasRef.current,
      imageUrl: imageUrl?.substring(0, 50) + '...'
    });
    
    if (!isOpen) {
      console.log('❌ ImageEditor: Dialog no está abierto, saltando inicialización');
      return;
    }
    
    if (!canvasRef.current) {
      console.log('❌ ImageEditor: canvasRef.current es null, saltando inicialización');
      return;
    }

    console.log('🚀 ImageEditor: Inicializando canvas...');
    
    // Crear el canvas de Fabric.js
    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      selection: true
    });

    // Configurar brush para dibujo libre
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = 3;

    setFabricCanvas(canvas);
    console.log('✅ ImageEditor: Canvas inicializado');

    // Cargar la imagen si está disponible
    if (imageUrl) {
      loadImageToCanvas(canvas, imageUrl);
    }

    return () => {
      console.log('🧹 ImageEditor: Limpiando canvas...');
      canvas.dispose();
      setFabricCanvas(null);
      setImageLoaded(false);
    };
  }, [isOpen, imageUrl, loadImageToCanvas]);

  // Actualizar configuración de herramientas
  useEffect(() => {
    if (!fabricCanvas) return;

    // Actualizar modo de dibujo
    fabricCanvas.isDrawingMode = activeTool === 'draw';
    
    if (activeTool === 'draw' && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
    }
  }, [activeTool, activeColor, fabricCanvas]);

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

    if (tool === 'circle') {
      const circle = new FabricCircle({
        left: 100,
        top: 100,
        radius: 30,
        fill: 'transparent',
        stroke: activeColor,
        strokeWidth: 3,
        selectable: true
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
    } else if (tool === 'arrow') {
      // Crear una flecha simple
      const line = new FabricLine([50, 50, 150, 150], {
        stroke: activeColor,
        strokeWidth: 3,
        selectable: true
      });

      fabricCanvas.add(line);
      fabricCanvas.setActiveObject(line);
    }
  };

  const handleUndo = () => {
    if (fabricCanvas) {
      const objects = fabricCanvas.getObjects();
      if (objects.length > 1) { // Mantener la imagen de fondo
        fabricCanvas.remove(objects[objects.length - 1]);
        fabricCanvas.renderAll();
      }
    }
  };

  const handleClear = () => {
    if (fabricCanvas) {
      const objects = fabricCanvas.getObjects();
      // Mantener solo la imagen de fondo
      if (objects.length > 1) {
        for (let i = objects.length - 1; i >= 1; i--) {
          fabricCanvas.remove(objects[i]);
        }
        fabricCanvas.renderAll();
      }
    }
  };

  const handleSave = async () => {
    if (!fabricCanvas) return;

    setIsLoading(true);
    try {
      // Exportar el canvas como imagen
      const dataURL = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1.0,
        multiplier: 1
      });

      // Convertir base64 a blob
      const response = await fetch(dataURL);
      const blob = await response.blob();

      // Generar nombre del archivo editado
      const fileName = imageName.replace(/\.[^/.]+$/, '') + '_edited.png';

      onSave(blob, fileName);
      onClose();
      
      toast({
        title: "Éxito",
        description: "Imagen editada y guardada correctamente"
      });
    } catch (error) {
      console.error('Error saving edited image:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la imagen editada",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!fabricCanvas) return;

    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 1
    });

    const link = document.createElement('a');
    link.download = imageName.replace(/\.[^/.]+$/, '') + '_edited.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col" aria-describedby="image-editor-description">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Editor de Imagen - {imageName}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Estado de carga */}
        {loadingImage && (
          <div className="flex items-center justify-center py-4 bg-blue-50 rounded-lg">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-blue-700">Cargando imagen...</span>
          </div>
        )}

        {/* Estado de imagen no cargada */}
        {!loadingImage && !imageLoaded && (
          <div className="flex items-center justify-center py-4 bg-amber-50 rounded-lg">
            <span className="text-sm text-amber-700">
              Imagen no disponible - Puedes usar las herramientas para crear anotaciones
            </span>
          </div>
        )}

        {/* Barra de herramientas */}
        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Button
              variant={activeTool === 'select' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolClick('select')}
            >
              <MousePointer className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === 'draw' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolClick('draw')}
            >
              <span className="text-sm">Dibujar</span>
            </Button>
            <Button
              variant={activeTool === 'circle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolClick('circle')}
            >
              <Circle className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === 'arrow' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolClick('arrow')}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Selector de color */}
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-gray-600" />
            <div className="flex gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded border-2 ${
                    activeColor === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setActiveColor(color)}
                />
              ))}
            </div>
            <Badge variant="outline" style={{ color: activeColor }}>
              {activeColor}
            </Badge>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleUndo}>
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear}>
              Limpiar
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
          <canvas 
            ref={canvasRef} 
            className="border border-gray-300 bg-white shadow-lg"
          />
        </div>

        {/* Instrucciones */}
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <strong>Instrucciones:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li><strong>Seleccionar:</strong> Mueve y modifica objetos existentes</li>
            <li><strong>Dibujar:</strong> Dibuja libremente sobre la imagen</li>
            <li><strong>Círculo:</strong> Agrega círculos para resaltar áreas</li>
            <li><strong>Flecha:</strong> Agrega flechas para señalar elementos</li>
            <li>Usa los colores para personalizar las anotaciones</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageEditor;