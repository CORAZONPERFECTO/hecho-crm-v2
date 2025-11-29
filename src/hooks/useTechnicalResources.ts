
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TechnicalResource {
  id: string;
  manufacturer: string;
  error_code: string;
  error_description: string;
  cause: string;
  solution: string;
  category: string;
  difficulty: 'facil' | 'medio' | 'dificil';
  created_at: string;
  updated_at: string;
}

export interface ManufacturerImage {
  id: string;
  manufacturer: string;
  image_url: string;
  description: string;
  board_type: string;
  created_at: string;
  updated_at: string;
}

export const useTechnicalResources = () => {
  const [resources, setResources] = useState<TechnicalResource[]>([]);
  const [manufacturerImages, setManufacturerImages] = useState<ManufacturerImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar recursos técnicos con logs detallados
  const loadResources = async () => {
    try {
      console.log('🔄 [SYNC] Iniciando carga completa de recursos técnicos...');
      setLoading(true);
      
      // Cargar todos los recursos sin consulta de conteo que causa problemas
      const { data, error } = await supabase
        .from('technical_resources')
        .select('*')
        .order('manufacturer', { ascending: true })
        .order('error_code', { ascending: true });

      if (error) {
        console.error('❌ [SYNC] Error al consultar technical_resources:', error);
        throw error;
      }
      
      console.log('📊 [SYNC] Datos RAW de Supabase:', data);
      console.log('📊 [SYNC] Total de registros encontrados:', data?.length || 0);
      
      // Log detallado de cada registro
      if (data && data.length > 0) {
        console.log('📋 [SYNC] Detalle de registros:');
        data.forEach((record, index) => {
          console.log(`  ${index + 1}. ${record.manufacturer} - ${record.error_code}: ${record.error_description}`);
        });
      } else {
        console.warn('⚠️ [SYNC] No se encontraron registros en technical_resources');
      }
      
      // Formatear y validar datos
      const formattedData = (data || []).map(resource => {
        const formatted = {
          ...resource,
          difficulty: (['facil', 'medio', 'dificil'].includes(resource.difficulty) 
            ? resource.difficulty 
            : 'medio') as 'facil' | 'medio' | 'dificil'
        };
        return formatted;
      });
      
      console.log('✅ [SYNC] Datos formateados:', formattedData.length, 'recursos');
      console.log('🏭 [SYNC] Fabricantes únicos encontrados:', [...new Set(formattedData.map(r => r.manufacturer))]);
      
      setResources(formattedData);
      console.log('💾 [SYNC] Estado actualizado con', formattedData.length, 'recursos');
      
    } catch (error: any) {
      console.error('❌ [SYNC] Error crítico cargando recursos técnicos:', error);
      console.error('❌ [SYNC] Detalles del error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      toast.error(`Error al cargar recursos técnicos: ${error.message || 'Error desconocido'}`);
      setResources([]);
    } finally {
      setLoading(false);
      console.log('🏁 [SYNC] Proceso de carga finalizado');
    }
  };

  // Cargar imágenes de fabricantes
  const loadManufacturerImages = async () => {
    try {
      console.log('🔄 Cargando imágenes de fabricantes...');
      
      const { data, error } = await supabase
        .from('manufacturer_images')
        .select('*')
        .order('manufacturer', { ascending: true });

      if (error) {
        console.error('❌ Error cargando imágenes:', error);
        throw error;
      }
      
      console.log('✅ Imágenes cargadas:', data?.length || 0);
      setManufacturerImages(data || []);
      
    } catch (error) {
      console.error('❌ Error cargando imágenes de fabricantes:', error);
      toast.error('Error al cargar las imágenes de fabricantes');
      setManufacturerImages([]);
    }
  };

  // Crear recurso técnico con manejo de duplicados
  const createResource = async (resource: Omit<TechnicalResource, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('🔄 Creando nuevo recurso:', resource);
      
      if (!resource.manufacturer || !resource.error_code || !resource.error_description) {
        throw new Error('Faltan campos obligatorios');
      }
      
      // Verificar si ya existe la combinación manufacturer + error_code
      const { data: existing, error: checkError } = await supabase
        .from('technical_resources')
        .select('id')
        .eq('manufacturer', resource.manufacturer)
        .eq('error_code', resource.error_code)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Error verificando duplicados:', checkError);
        throw checkError;
      }

      if (existing) {
        console.log('⚠️ Registro duplicado encontrado, actualizando en su lugar');
        return await updateResource(existing.id, resource);
      }
      
      const { data, error } = await supabase
        .from('technical_resources')
        .insert({
          ...resource,
          difficulty: resource.difficulty || 'medio'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando recurso:', error);
        throw error;
      }
      
      const formattedData = {
        ...data,
        difficulty: (data.difficulty as 'facil' | 'medio' | 'dificil') || 'medio'
      };
      
      setResources(prev => [...prev, formattedData]);
      toast.success('Error técnico creado exitosamente');
      console.log('✅ Recurso creado y agregado al estado:', formattedData);
      
      return formattedData;
    } catch (error) {
      console.error('❌ Error creando recurso técnico:', error);
      toast.error('Error al crear el recurso técnico');
      throw error;
    }
  };

  // Actualizar recurso técnico
  const updateResource = async (id: string, updates: Partial<TechnicalResource>) => {
    try {
      console.log('🔄 Actualizando recurso:', id, updates);
      
      const { data, error } = await supabase
        .from('technical_resources')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString(),
          difficulty: updates.difficulty || 'medio'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando recurso:', error);
        throw error;
      }
      
      const formattedData = {
        ...data,
        difficulty: (data.difficulty as 'facil' | 'medio' | 'dificil') || 'medio'
      };
      
      setResources(prev => prev.map(r => r.id === id ? formattedData : r));
      toast.success('Error técnico actualizado exitosamente');
      console.log('✅ Recurso actualizado:', formattedData);
      
      return formattedData;
    } catch (error) {
      console.error('❌ Error actualizando recurso técnico:', error);
      toast.error('Error al actualizar el recurso técnico');
      throw error;
    }
  };

  // Eliminar recurso técnico
  const deleteResource = async (id: string) => {
    try {
      console.log('🔄 Eliminando recurso:', id);
      
      const { error } = await supabase
        .from('technical_resources')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error eliminando recurso:', error);
        throw error;
      }
      
      setResources(prev => prev.filter(r => r.id !== id));
      toast.success('Error técnico eliminado exitosamente');
      console.log('✅ Recurso eliminado del estado:', id);
      
    } catch (error) {
      console.error('❌ Error eliminando recurso técnico:', error);
      toast.error('Error al eliminar el recurso técnico');
      throw error;
    }
  };

  // Crear imagen de fabricante
  const createManufacturerImage = async (image: Omit<ManufacturerImage, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('🔄 Creando imagen:', image);
      
      if (!image.manufacturer || !image.image_url) {
        throw new Error('Faltan campos obligatorios para la imagen');
      }
      
      const { data, error } = await supabase
        .from('manufacturer_images')
        .insert(image)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando imagen:', error);
        throw error;
      }
      
      setManufacturerImages(prev => [...prev, data]);
      toast.success('Imagen de fabricante creada exitosamente');
      console.log('✅ Imagen creada:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error creando imagen de fabricante:', error);
      toast.error('Error al crear la imagen del fabricante');
      throw error;
    }
  };

  // Actualizar imagen de fabricante
  const updateManufacturerImage = async (id: string, updates: Partial<ManufacturerImage>) => {
    try {
      const { data, error } = await supabase
        .from('manufacturer_images')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setManufacturerImages(prev => prev.map(img => img.id === id ? data : img));
      toast.success('Imagen de fabricante actualizada exitosamente');
      return data;
    } catch (error) {
      console.error('Error updating manufacturer image:', error);
      toast.error('Error al actualizar la imagen del fabricante');
      throw error;
    }
  };

  // Eliminar imagen de fabricante
  const deleteManufacturerImage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('manufacturer_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setManufacturerImages(prev => prev.filter(img => img.id !== id));
      toast.success('Imagen de fabricante eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting manufacturer image:', error);
      toast.error('Error al eliminar la imagen del fabricante');
      throw error;
    }
  };

  // Obtener fabricantes únicos
  const getUniqueManufacturers = () => {
    const manufacturers = [...new Set(resources.map(r => r.manufacturer))].filter(Boolean);
    console.log('🏭 getUniqueManufacturers - Fabricantes extraídos:', manufacturers);
    return manufacturers.sort();
  };

  // Obtener categorías únicas
  const getUniqueCategories = () => {
    const categories = [...new Set(resources.map(r => r.category))].filter(Boolean);
    return categories.sort();
  };

  // Efecto principal para cargar datos
  useEffect(() => {
    const loadData = async () => {
      console.log('🚀 [INIT] Iniciando carga inicial de datos...');
      setLoading(true);
      
      try {
        await Promise.all([
          loadResources(),
          loadManufacturerImages()
        ]);
        console.log('✅ [INIT] Carga inicial completada exitosamente');
      } catch (error) {
        console.error('❌ [INIT] Error en la carga inicial de datos:', error);
      } finally {
        setLoading(false);
        console.log('🏁 [INIT] Proceso de inicialización finalizado');
      }
    };

    loadData();
  }, []);

  // Log del estado actual cuando cambian los recursos
  useEffect(() => {
    console.log('📊 [STATE] Estado de recursos actualizado:', {
      total: resources.length,
      fabricantes: getUniqueManufacturers(),
      ultimaActualizacion: new Date().toISOString()
    });
  }, [resources]);

  return {
    resources,
    manufacturerImages,
    loading,
    loadResources,
    loadManufacturerImages,
    createResource,
    updateResource,
    deleteResource,
    createManufacturerImage,
    updateManufacturerImage,
    deleteManufacturerImage,
    getUniqueManufacturers,
    getUniqueCategories
  };
};
