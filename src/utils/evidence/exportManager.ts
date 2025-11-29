import { supabase } from '@/integrations/supabase/client';
import { Evidence } from './pdfGenerator';

export interface ExportResult {
  blob: Blob;
  fileName: string;
}

export interface ExportMetadata {
  ticketNumber?: string;
  ticketTitle?: string;
  clientName?: string;
  description?: string;
  evidencesCount?: number;
  annotations?: any[];
}

/**
 * Guarda un reporte exportado en Supabase Storage y en la base de datos
 */
export const saveExportedReport = async (
  ticketId: string,
  reportType: 'pdf' | 'word' | 'zip',
  fileName: string,
  fileBlob: Blob,
  generatedBy: string,
  description?: string,
  metadata?: ExportMetadata
): Promise<{ id: string; file_url: string } | null> => {
  try {
    console.log('💾 Guardando reporte exportado:', { ticketId, reportType, fileName });

    // 1. Subir archivo a storage
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${ticketId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ticket-exported-reports')
      .upload(uniqueFileName, fileBlob, {
        contentType: fileBlob.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Error subiendo archivo:', uploadError);
      throw uploadError;
    }

    console.log('✅ Archivo subido a storage:', uploadData.path);

    // 2. Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('ticket-exported-reports')
      .getPublicUrl(uniqueFileName);

    console.log('🔗 URL pública generada:', publicUrl);

    // 3. Guardar registro en base de datos
    const { data: dbData, error: dbError } = await supabase
      .from('ticket_exported_reports')
      .insert([{
        ticket_id: ticketId,
        report_type: reportType,
        file_name: fileName,
        file_url: publicUrl,
        file_size: fileBlob.size,
        generated_by: generatedBy,
        description: description || null,
        metadata: (metadata as any) || null
      }])
      .select()
      .single();

    if (dbError) {
      console.error('❌ Error guardando en BD:', dbError);
      // Intentar limpiar el archivo subido
      await supabase.storage
        .from('ticket-exported-reports')
        .remove([uniqueFileName]);
      throw dbError;
    }

    console.log('✅ Reporte guardado en BD:', dbData.id);

    return {
      id: dbData.id,
      file_url: publicUrl
    };
  } catch (error) {
    console.error('❌ Error en saveExportedReport:', error);
    return null;
  }
};

/**
 * Descarga un blob como archivo
 */
export const downloadBlob = (blob: Blob, fileName: string): void => {
  console.log('⬇️ Iniciando descarga:', fileName, 'Tamaño:', blob.size, 'bytes');
  
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    
    console.log('✅ Elemento de descarga creado, iniciando click...');
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('✅ Descarga completada y limpieza realizada');
    }, 100);
  } catch (error) {
    console.error('❌ Error descargando blob:', error);
    // Fallback: abrir en nueva ventana
    try {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      console.log('✅ Fallback: archivo abierto en nueva ventana');
    } catch (fallbackError) {
      console.error('❌ Error en fallback de descarga:', fallbackError);
      throw fallbackError;
    }
  }
};

/**
 * Notifica a otros componentes que se actualizaron los reportes exportados
 */
export const notifyReportsUpdated = (ticketId: string): void => {
  window.dispatchEvent(
    new CustomEvent('ticket-exported-reports:updated', { 
      detail: { ticketId } 
    })
  );
};
