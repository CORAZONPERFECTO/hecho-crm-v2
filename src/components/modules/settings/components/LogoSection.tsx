
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LogoUpload from '../LogoUpload';

interface LogoSectionProps {
  companyLogo: string;
  onLogoChange: (logoUrl: string) => void;
  uploadFunction: (file: File) => Promise<string | null>;
}

const LogoSection: React.FC<LogoSectionProps> = ({ 
  companyLogo, 
  onLogoChange, 
  uploadFunction 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Logotipo de la Empresa</CardTitle>
        <CardDescription>Sube el logo que aparecerá en los documentos y cotizaciones.</CardDescription>
      </CardHeader>
      <CardContent>
        <LogoUpload 
          currentLogo={companyLogo} 
          onLogoChange={onLogoChange}
          uploadFunction={uploadFunction}
        />
        <p className="mt-2 text-xs text-gray-500">PNG, JPG, SVG hasta 2MB. Se guardará en Supabase.</p>
      </CardContent>
    </Card>
  );
};

export default LogoSection;
