
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, FileSpreadsheet, FileUp, ShoppingCart, Eye, Loader2, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DocumentPreview from './DocumentPreview';
import TemplateDesigner from './TemplateDesigner';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';

// Tipos de datos para las plantillas integradas con la base de datos

const TemplateSelector: React.FC<{ 
  title: string; 
  documentType: 'invoice' | 'quotation' | 'delivery_note' | 'purchase_order';
}> = ({ title, documentType }) => {
    const { 
        getTemplatesByType, 
        getDefaultTemplateId, 
        updateDefaultTemplate, 
        loading 
    } = useDocumentTemplates();
    
    const templates = getTemplatesByType(documentType);
    const defaultTemplate = getDefaultTemplateId(documentType);
    
    const [selectedTemplate, setSelectedTemplate] = useState(defaultTemplate);
    const [showPreview, setShowPreview] = useState(false);
    const [saving, setSaving] = useState(false);

    // Actualizar selectedTemplate cuando cambie el defaultTemplate de la BD
    React.useEffect(() => {
        if (defaultTemplate && selectedTemplate !== defaultTemplate) {
            setSelectedTemplate(defaultTemplate);
        }
    }, [defaultTemplate]);

    const handleSave = async () => {
        setSaving(true);
        const success = await updateDefaultTemplate(documentType, selectedTemplate);
        setSaving(false);
    };

    const selectedTemplateData = templates.find(t => t.template_id === selectedTemplate);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>Cargando plantillas...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    {title}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center space-x-2"
                    >
                        <Eye size={16} />
                        <span>{showPreview ? 'Ocultar' : 'Ver'} Vista Previa</span>
                    </Button>
                </CardTitle>
                <CardDescription>Selecciona la plantilla por defecto para este tipo de documento.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className={`grid ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
                    <div>
                <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate} className="mb-6">
                            <div className="grid grid-cols-1 gap-4">
                                {templates.map((template) => (
                                    <Label 
                                        key={template.template_id} 
                                        htmlFor={`${template.template_id}-${title.replace(/\s+/g, '')}`} 
                                        className={`relative flex items-center rounded-lg border-2 p-4 cursor-pointer transition-all hover:border-primary ${
                                            selectedTemplate === template.template_id 
                                                ? 'border-primary shadow-md bg-primary/5' 
                                                : 'border-muted'
                                        } ${template.is_default ? 'ring-2 ring-blue-200' : ''}`}
                                    >
                                        <RadioGroupItem 
                                            value={template.template_id} 
                                            id={`${template.template_id}-${title.replace(/\s+/g, '')}`} 
                                            className="mr-3" 
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold text-sm">{template.name}</div>
                                                {template.is_default && (
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                        Recomendada
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                                        </div>
                                    </Label>
                                ))}
                            </div>
                        </RadioGroup>
                        <div className="flex justify-end">
                            <Button 
                                onClick={handleSave} 
                                disabled={saving || selectedTemplate === defaultTemplate}
                            >
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {saving ? 'Guardando...' : 'Guardar Preferencia'}
                            </Button>
                        </div>
                    </div>

                    {showPreview && (
                        <div className="lg:border-l lg:pl-6">
                            <div className="mb-4">
                                <h4 className="font-semibold text-sm mb-2">Vista Previa: {selectedTemplateData?.name}</h4>
                                <p className="text-xs text-muted-foreground mb-4">{selectedTemplateData?.description}</p>
                            </div>
                            <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                                <DocumentPreview type={documentType} templateId={selectedTemplate} />
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const DocumentSettings: React.FC = () => {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Documentos y Plantillas</CardTitle>
                    <CardDescription>
                        Gestiona el diseño y la apariencia de los documentos oficiales que genera el sistema. 
                        Las plantillas están integradas con la base de datos y incluyen estilos optimizados para diferentes casos de uso.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Tabs defaultValue="templates" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                    <TabsTrigger value="templates">
                        <FileText className="w-4 h-4 mr-2" />
                        Plantillas
                    </TabsTrigger>
                    <TabsTrigger value="designer">
                        <Palette className="w-4 h-4 mr-2" />
                        Diseñador
                    </TabsTrigger>
                    <TabsTrigger value="invoice">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Facturas
                    </TabsTrigger>
                    <TabsTrigger value="quotation">
                        <FileUp className="w-4 h-4 mr-2" />
                        Cotizaciones
                    </TabsTrigger>
                    <TabsTrigger value="delivery_note">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Conduces
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="templates" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <TemplateSelector 
                            title="Plantillas de Factura" 
                            documentType="invoice"
                        />
                        <TemplateSelector 
                            title="Plantillas de Cotización" 
                            documentType="quotation"
                        />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        <TemplateSelector 
                            title="Plantillas de Conduce" 
                            documentType="delivery_note"
                        />
                        <TemplateSelector 
                            title="Plantillas de Orden de Compra" 
                            documentType="purchase_order"
                        />
                    </div>
                </TabsContent>

                <TabsContent value="designer" className="mt-6">
                    <TemplateDesigner />
                </TabsContent>
                
                <TabsContent value="invoice" className="mt-6">
                    <TemplateSelector 
                        title="Plantillas de Factura" 
                        documentType="invoice"
                    />
                </TabsContent>
                <TabsContent value="quotation" className="mt-6">
                    <TemplateSelector 
                        title="Plantillas de Cotización" 
                        documentType="quotation"
                    />
                </TabsContent>
                <TabsContent value="delivery_note" className="mt-6">
                    <TemplateSelector 
                        title="Plantillas de Conduce" 
                        documentType="delivery_note"
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default DocumentSettings;
