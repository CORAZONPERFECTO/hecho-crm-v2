
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LogoUploadProps {
  currentLogo?: string;
  onLogoChange: (logoUrl: string) => void;
  uploadFunction?: (file: File) => Promise<string | null>;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ 
  currentLogo, 
  onLogoChange, 
  uploadFunction 
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo debe ser menor a 2MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      let logoUrl: string;

      if (uploadFunction) {
        // Use Supabase upload function
        const uploadedUrl = await uploadFunction(file);
        if (!uploadedUrl) {
          throw new Error('Failed to upload to Supabase');
        }
        logoUrl = uploadedUrl;
      } else {
        // Fallback to base64 (localStorage)
        const reader = new FileReader();
        logoUrl = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        localStorage.setItem('companyLogo', logoUrl);
      }

      setPreviewUrl(logoUrl);
      onLogoChange(logoUrl);
      
      toast({
        title: "Éxito",
        description: "Logo subido correctamente.",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: "Error al subir el logo. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setPreviewUrl(null);
    onLogoChange('');
    localStorage.removeItem('companyLogo');
    
    toast({
      title: "Logo eliminado",
      description: "El logo ha sido eliminado correctamente.",
    });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden">
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt="Logo de la empresa" 
            className="h-full w-full object-contain"
          />
        ) : (
          <Image className="h-8 w-8 text-gray-400" />
        )}
      </div>
      
      <div className="flex flex-col gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleFileSelect}
          disabled={uploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? 'Subiendo...' : previewUrl ? 'Cambiar logo' : 'Subir logo'}
        </Button>
        
        {previewUrl && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={handleRemoveLogo}
            className="text-red-600 hover:text-red-700"
          >
            <X className="mr-1 h-3 w-3" />
            Eliminar
          </Button>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default LogoUpload;
