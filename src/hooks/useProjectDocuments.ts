
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProjectDocumentType {
  id: string;
  name: string;
  icon?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  file_path: string;
  file_type: string;
  file_size?: number;
  document_type_id?: string;
  uploaded_by?: string;
  is_key_document: boolean;
  created_at: string;
  updated_at: string;
  document_type?: ProjectDocumentType;
}

export const useProjectDocuments = (projectId?: string) => {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [documentTypes, setDocumentTypes] = useState<ProjectDocumentType[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchDocumentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('project_document_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setDocumentTypes(data || []);
    } catch (error) {
      console.error('Error fetching document types:', error);
    }
  };

  const fetchDocuments = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_scanned_documents')
        .select(`
          *,
          document_type:project_document_types(*)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching project documents:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los documentos del proyecto",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (
    file: File,
    name: string,
    description?: string,
    documentTypeId?: string,
    isKeyDocument = false
  ) => {
    if (!projectId) throw new Error('Project ID is required');

    try {
      // Subir archivo a storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('project-scanned-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública del archivo
      const { data: { publicUrl } } = supabase.storage
        .from('project-scanned-documents')
        .getPublicUrl(fileName);

      // Guardar registro en la base de datos
      const { data, error } = await supabase
        .from('project_scanned_documents')
        .insert([{
          project_id: projectId,
          name: name,
          description: description,
          file_path: fileName,
          file_type: file.type,
          file_size: file.size,
          document_type_id: documentTypeId,
          is_key_document: isKeyDocument
        }])
        .select(`
          *,
          document_type:project_document_types(*)
        `)
        .single();

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Documento subido correctamente"
      });

      await fetchDocuments();
      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "No se pudo subir el documento",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteDocument = async (documentId: string, filePath: string) => {
    try {
      // Eliminar archivo del storage
      await supabase.storage
        .from('project-scanned-documents')
        .remove([filePath]);

      // Eliminar registro de la base de datos
      const { error } = await supabase
        .from('project_scanned_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Documento eliminado correctamente"
      });

      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el documento",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateDocument = async (documentId: string, updates: Partial<ProjectDocument>) => {
    try {
      const { error } = await supabase
        .from('project_scanned_documents')
        .update(updates)
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Documento actualizado correctamente"
      });

      await fetchDocuments();
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el documento",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchDocuments();
    }
  }, [projectId]);

  return {
    documents,
    documentTypes,
    loading,
    uploadDocument,
    deleteDocument,
    updateDocument,
    refetch: fetchDocuments
  };
};
