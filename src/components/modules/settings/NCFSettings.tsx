import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NCFType {
  id: string;
  code: string;
  name: string;
  description: string;
  prefix: string;
  is_active: boolean;
}

interface NCFSeries {
  sequence: number;
  rangeFrom: number;
  rangeTo: number;
  description?: string;
}

const NCFSettings: React.FC = () => {
  const [ncfEnabled, setNcfEnabled] = useState(false);
  const [ncfTypes, setNcfTypes] = useState<NCFType[]>([]);
  const [ncfSeries, setNcfSeries] = useState<Record<string, NCFSeries>>({});
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ sequence: number; rangeFrom: number; rangeTo: number; }>({
    sequence: 0,
    rangeFrom: 1,
    rangeTo: 999999
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadNCFConfiguration();
  }, []);

  const loadNCFConfiguration = async () => {
    try {
      // Cargar tipos de NCF
      const { data: types, error: typesError } = await supabase
        .from('ncf_types')
        .select('*')
        .eq('is_active', true)
        .order('code');

      if (typesError) throw typesError;

      // Cargar configuración de empresa
      const { data: settings, error: settingsError } = await supabase
        .from('company_settings')
        .select('ncf_enabled, ncf_series, current_ncf_sequences')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      setNcfTypes(types || []);
      setNcfEnabled(settings?.ncf_enabled || false);
      setNcfSeries((settings?.ncf_series as unknown as Record<string, NCFSeries>) || {});
    } catch (error) {
      console.error('Error loading NCF configuration:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración de NCF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveNCFConfiguration = async () => {
    try {
      setLoading(true);

      // Primero obtener configuración existente
      const { data: existingSettings } = await supabase
        .from('company_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const updateData = {
        ...existingSettings,
        ncf_enabled: ncfEnabled,
        ncf_series: ncfSeries as any,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('company_settings')
        .upsert(updateData);

      if (error) throw error;

      toast({
        title: "Configuración guardada",
        description: "La configuración de NCF se ha actualizado correctamente",
      });
    } catch (error) {
      console.error('Error saving NCF configuration:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (typeCode: string) => {
    const series = ncfSeries[typeCode] || { sequence: 0, rangeFrom: 1, rangeTo: 999999 };
    setEditValues(series);
    setEditingType(typeCode);
  };

  const saveEdit = () => {
    if (editingType) {
      setNcfSeries(prev => ({
        ...prev,
        [editingType]: editValues
      }));
      setEditingType(null);
    }
  };

  const cancelEdit = () => {
    setEditingType(null);
    setEditValues({ sequence: 0, rangeFrom: 1, rangeTo: 999999 });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuración de NCF</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando configuración...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de NCF (Números de Comprobante Fiscal)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="ncf-enabled"
              checked={ncfEnabled}
              onCheckedChange={setNcfEnabled}
            />
            <Label htmlFor="ncf-enabled">Habilitar numeración NCF</Label>
          </div>

          {ncfEnabled && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Configure las series de numeración para cada tipo de comprobante fiscal.
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Secuencia Actual</TableHead>
                    <TableHead>Rango Desde</TableHead>
                    <TableHead>Rango Hasta</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ncfTypes.map((type) => {
                    const series = ncfSeries[type.code];
                    const isEditing = editingType === type.code;

                    return (
                      <TableRow key={type.id}>
                        <TableCell>
                          <Badge variant="outline">{type.code}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{type.name}</div>
                            <div className="text-sm text-muted-foreground">{type.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editValues.sequence}
                              onChange={(e) => setEditValues(prev => ({ ...prev, sequence: parseInt(e.target.value) || 0 }))}
                              className="w-24"
                            />
                          ) : (
                            series?.sequence || 0
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editValues.rangeFrom}
                              onChange={(e) => setEditValues(prev => ({ ...prev, rangeFrom: parseInt(e.target.value) || 1 }))}
                              className="w-24"
                            />
                          ) : (
                            series?.rangeFrom || 1
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editValues.rangeTo}
                              onChange={(e) => setEditValues(prev => ({ ...prev, rangeTo: parseInt(e.target.value) || 999999 }))}
                              className="w-32"
                            />
                          ) : (
                            series?.rangeTo || 999999
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={series ? "default" : "secondary"}>
                            {series ? "Configurado" : "Sin configurar"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <div className="flex space-x-1">
                              <Button size="sm" onClick={saveEdit}>
                                <Save size={14} />
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>
                                <X size={14} />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => startEditing(type.code)}
                            >
                              <Edit size={14} />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={saveNCFConfiguration} disabled={loading}>
              {loading ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NCFSettings;