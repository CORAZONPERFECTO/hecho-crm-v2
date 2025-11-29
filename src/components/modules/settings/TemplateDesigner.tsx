import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Layout, 
  Save, 
  Eye, 
  Undo, 
  Redo,
  Copy,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TemplateStyleConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  fonts: {
    heading: string;
    body: string;
    size: {
      heading: number;
      body: number;
      small: number;
    };
  };
  layout: {
    headerHeight: number;
    footerHeight: number;
    margins: number;
    padding: number;
  };
  logo: {
    position: 'left' | 'center' | 'right';
    size: number;
    url?: string;
  };
  elements: {
    showBorder: boolean;
    borderRadius: number;
    shadowIntensity: number;
  };
}

const defaultTemplateConfig: TemplateStyleConfig = {
  id: 'custom',
  name: 'Mi Plantilla Personalizada',
  colors: {
    primary: '#1f2937',
    secondary: '#6b7280',
    accent: '#3b82f6',
    text: '#111827',
    background: '#ffffff'
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    size: {
      heading: 24,
      body: 14,
      small: 12
    }
  },
  layout: {
    headerHeight: 120,
    footerHeight: 80,
    margins: 40,
    padding: 20
  },
  logo: {
    position: 'left',
    size: 60
  },
  elements: {
    showBorder: true,
    borderRadius: 8,
    shadowIntensity: 2
  }
};

const fontOptions = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
  'Poppins', 'Source Sans Pro', 'Oswald', 'Raleway', 'Ubuntu'
];

const TemplateDesigner: React.FC = () => {
  const [config, setConfig] = useState<TemplateStyleConfig>(defaultTemplateConfig);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleConfigChange = (section: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof TemplateStyleConfig] as any),
        [field]: value
      }
    }));
  };

  const handleNestedConfigChange = (section: string, subsection: string, field: string, value: any) => {
    setConfig(prev => {
      const sectionData = prev[section as keyof TemplateStyleConfig] as any;
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [subsection]: {
            ...sectionData[subsection],
            [field]: value
          }
        }
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: "Plantilla guardada",
      description: "Los cambios se han guardado exitosamente."
    });
  };

  const generatePreviewHTML = () => {
    return `
      <div style="
        font-family: ${config.fonts.body};
        background-color: ${config.colors.background};
        padding: ${config.layout.margins}px;
        min-height: 100%;
      ">
        <!-- Header -->
        <div style="
          height: ${config.layout.headerHeight}px;
          background-color: ${config.colors.primary};
          color: white;
          padding: ${config.layout.padding}px;
          display: flex;
          align-items: center;
          justify-content: ${config.logo.position === 'center' ? 'center' : 'space-between'};
          ${config.elements.showBorder ? `border-radius: ${config.elements.borderRadius}px;` : ''}
          box-shadow: ${config.elements.shadowIntensity === 0 ? 'none' : `0 ${config.elements.shadowIntensity * 2}px ${config.elements.shadowIntensity * 4}px rgba(0,0,0,0.1)`};
          margin-bottom: 20px;
        ">
          <div style="display: flex; align-items: center;">
            <div style="
              width: ${config.logo.size}px;
              height: ${config.logo.size}px;
              background-color: rgba(255,255,255,0.2);
              border-radius: 4px;
              margin-right: 15px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
            ">LOGO</div>
            <div>
              <h1 style="
                font-family: ${config.fonts.heading};
                font-size: ${config.fonts.size.heading}px;
                margin: 0;
                font-weight: bold;
              ">EMPRESA S.A.</h1>
              <p style="margin: 0; opacity: 0.8; font-size: ${config.fonts.size.small}px;">Documento Comercial</p>
            </div>
          </div>
          ${config.logo.position !== 'center' ? `
            <div style="text-align: right;">
              <p style="margin: 0; font-size: ${config.fonts.size.small}px;">Fecha: 20/07/2025</p>
              <p style="margin: 0; font-size: ${config.fonts.size.small}px;">Doc: #12345</p>
            </div>
          ` : ''}
        </div>

        <!-- Content -->
        <div style="
          background-color: white;
          padding: ${config.layout.padding * 1.5}px;
          ${config.elements.showBorder ? `border-radius: ${config.elements.borderRadius}px;` : ''}
          box-shadow: ${config.elements.shadowIntensity === 0 ? 'none' : `0 ${config.elements.shadowIntensity}px ${config.elements.shadowIntensity * 2}px rgba(0,0,0,0.05)`};
          margin-bottom: 20px;
          border: 1px solid #e5e7eb;
        ">
          <div style="margin-bottom: 20px;">
            <h2 style="
              color: ${config.colors.accent};
              font-family: ${config.fonts.heading};
              font-size: ${config.fonts.size.heading * 0.8}px;
              margin: 0 0 10px 0;
            ">Cliente</h2>
            <p style="
              color: ${config.colors.text};
              font-size: ${config.fonts.size.body}px;
              margin: 0;
              line-height: 1.5;
            ">Juan Pérez<br>Calle Principal 123<br>Ciudad, País</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: ${config.colors.primary}; color: white;">
                <th style="padding: 12px; text-align: left; font-size: ${config.fonts.size.body}px;">Descripción</th>
                <th style="padding: 12px; text-align: center; font-size: ${config.fonts.size.body}px;">Cant.</th>
                <th style="padding: 12px; text-align: right; font-size: ${config.fonts.size.body}px;">Precio</th>
                <th style="padding: 12px; text-align: right; font-size: ${config.fonts.size.body}px;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; font-size: ${config.fonts.size.body}px;">Servicio de mantenimiento</td>
                <td style="padding: 12px; text-align: center; font-size: ${config.fonts.size.body}px;">1</td>
                <td style="padding: 12px; text-align: right; font-size: ${config.fonts.size.body}px;">$500.00</td>
                <td style="padding: 12px; text-align: right; font-size: ${config.fonts.size.body}px;">$500.00</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; font-size: ${config.fonts.size.body}px;">Repuestos</td>
                <td style="padding: 12px; text-align: center; font-size: ${config.fonts.size.body}px;">2</td>
                <td style="padding: 12px; text-align: right; font-size: ${config.fonts.size.body}px;">$150.00</td>
                <td style="padding: 12px; text-align: right; font-size: ${config.fonts.size.body}px;">$300.00</td>
              </tr>
            </tbody>
          </table>

          <div style="text-align: right; margin-top: 20px;">
            <div style="
              background-color: ${config.colors.accent};
              color: white;
              padding: 15px;
              ${config.elements.showBorder ? `border-radius: ${config.elements.borderRadius}px;` : ''}
              display: inline-block;
            ">
              <strong style="font-size: ${config.fonts.size.heading * 0.7}px;">Total: $800.00</strong>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="
          height: ${config.layout.footerHeight}px;
          background-color: ${config.colors.secondary};
          color: white;
          padding: ${config.layout.padding}px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          ${config.elements.showBorder ? `border-radius: ${config.elements.borderRadius}px;` : ''}
          font-size: ${config.fonts.size.small}px;
        ">
          <div>
            <p style="margin: 0;">© 2025 Empresa S.A. - Todos los derechos reservados</p>
          </div>
          <div>
            <p style="margin: 0;">contacto@empresa.com | +1 234 567 8900</p>
          </div>
        </div>
      </div>
    `;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Panel de Control */}
      <div className="w-full lg:w-80 bg-white rounded-lg shadow-sm border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Diseñador de Plantillas
          </CardTitle>
          <CardDescription>
            Personaliza los estilos y elementos de tu plantilla
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] px-6">
            <Tabs defaultValue="colors" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="colors">Colores</TabsTrigger>
                <TabsTrigger value="fonts">Fuentes</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="elements">Elementos</TabsTrigger>
              </TabsList>

              {/* Colores */}
              <TabsContent value="colors" className="space-y-4">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.colors.primary }}></div>
                    Color Primario
                  </Label>
                  <Input
                    type="color"
                    value={config.colors.primary}
                    onChange={(e) => handleNestedConfigChange('colors', '', 'primary', e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.colors.secondary }}></div>
                    Color Secundario
                  </Label>
                  <Input
                    type="color"
                    value={config.colors.secondary}
                    onChange={(e) => handleNestedConfigChange('colors', '', 'secondary', e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.colors.accent }}></div>
                    Color de Acento
                  </Label>
                  <Input
                    type="color"
                    value={config.colors.accent}
                    onChange={(e) => handleNestedConfigChange('colors', '', 'accent', e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.colors.text }}></div>
                    Color de Texto
                  </Label>
                  <Input
                    type="color"
                    value={config.colors.text}
                    onChange={(e) => handleNestedConfigChange('colors', '', 'text', e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.colors.background }}></div>
                    Color de Fondo
                  </Label>
                  <Input
                    type="color"
                    value={config.colors.background}
                    onChange={(e) => handleNestedConfigChange('colors', '', 'background', e.target.value)}
                    className="h-12"
                  />
                </div>
              </TabsContent>

              {/* Fuentes */}
              <TabsContent value="fonts" className="space-y-4">
                <div className="space-y-3">
                  <Label>Fuente de Títulos</Label>
                  <Select
                    value={config.fonts.heading}
                    onValueChange={(value) => handleNestedConfigChange('fonts', '', 'heading', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map(font => (
                        <SelectItem key={font} value={font}>{font}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Fuente de Texto</Label>
                  <Select
                    value={config.fonts.body}
                    onValueChange={(value) => handleNestedConfigChange('fonts', '', 'body', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map(font => (
                        <SelectItem key={font} value={font}>{font}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Tamaño de Título: {config.fonts.size.heading}px</Label>
                  <Slider
                    value={[config.fonts.size.heading]}
                    onValueChange={(value) => handleNestedConfigChange('fonts', 'size', 'heading', value[0])}
                    max={32}
                    min={16}
                    step={1}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Tamaño de Texto: {config.fonts.size.body}px</Label>
                  <Slider
                    value={[config.fonts.size.body]}
                    onValueChange={(value) => handleNestedConfigChange('fonts', 'size', 'body', value[0])}
                    max={18}
                    min={10}
                    step={1}
                  />
                </div>
              </TabsContent>

              {/* Layout */}
              <TabsContent value="layout" className="space-y-4">
                <div className="space-y-3">
                  <Label>Altura del Header: {config.layout.headerHeight}px</Label>
                  <Slider
                    value={[config.layout.headerHeight]}
                    onValueChange={(value) => handleNestedConfigChange('layout', '', 'headerHeight', value[0])}
                    max={200}
                    min={80}
                    step={10}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Altura del Footer: {config.layout.footerHeight}px</Label>
                  <Slider
                    value={[config.layout.footerHeight]}
                    onValueChange={(value) => handleNestedConfigChange('layout', '', 'footerHeight', value[0])}
                    max={120}
                    min={60}
                    step={10}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Márgenes: {config.layout.margins}px</Label>
                  <Slider
                    value={[config.layout.margins]}
                    onValueChange={(value) => handleNestedConfigChange('layout', '', 'margins', value[0])}
                    max={80}
                    min={20}
                    step={5}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Espaciado: {config.layout.padding}px</Label>
                  <Slider
                    value={[config.layout.padding]}
                    onValueChange={(value) => handleNestedConfigChange('layout', '', 'padding', value[0])}
                    max={40}
                    min={10}
                    step={5}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Posición del Logo</Label>
                  <Select
                    value={config.logo.position}
                    onValueChange={(value) => handleNestedConfigChange('logo', '', 'position', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Izquierda</SelectItem>
                      <SelectItem value="center">Centro</SelectItem>
                      <SelectItem value="right">Derecha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Tamaño del Logo: {config.logo.size}px</Label>
                  <Slider
                    value={[config.logo.size]}
                    onValueChange={(value) => handleNestedConfigChange('logo', '', 'size', value[0])}
                    max={100}
                    min={40}
                    step={5}
                  />
                </div>
              </TabsContent>

              {/* Elementos */}
              <TabsContent value="elements" className="space-y-4">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.elements.showBorder}
                      onChange={(e) => handleNestedConfigChange('elements', '', 'showBorder', e.target.checked)}
                      className="rounded"
                    />
                    Mostrar bordes redondeados
                  </Label>
                </div>

                {config.elements.showBorder && (
                  <div className="space-y-3">
                    <Label>Radio de borde: {config.elements.borderRadius}px</Label>
                    <Slider
                      value={[config.elements.borderRadius]}
                      onValueChange={(value) => handleNestedConfigChange('elements', '', 'borderRadius', value[0])}
                      max={20}
                      min={0}
                      step={1}
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <Label>Intensidad de sombra: {config.elements.shadowIntensity}</Label>
                  <Slider
                    value={[config.elements.shadowIntensity]}
                    onValueChange={(value) => handleNestedConfigChange('elements', '', 'shadowIntensity', value[0])}
                    max={5}
                    min={0}
                    step={1}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>

          <Separator />
          
          <div className="p-6 space-y-3">
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Guardando...' : 'Guardar Plantilla'}
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-2" />
                {isPreviewMode ? 'Editor' : 'Vista Previa'}
              </Button>
              
              <Button variant="outline" size="sm">
                <Copy className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Vista Previa */}
      <div className="flex-1 bg-gray-50 rounded-lg p-6">
        <div className="bg-white rounded-lg shadow-sm h-full">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Vista Previa</h3>
              <p className="text-sm text-muted-foreground">
                {config.name} - Documento de ejemplo
              </p>
            </div>
            <Badge variant="outline">Live Preview</Badge>
          </div>
          
          <ScrollArea className="h-[600px]">
            <div 
              className="p-4"
              dangerouslySetInnerHTML={{ __html: generatePreviewHTML() }}
            />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default TemplateDesigner;