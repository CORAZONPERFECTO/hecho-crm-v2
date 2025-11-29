
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NotesStatusSectionProps {
  formData: {
    internalNotes: string;
    status: 'activo' | 'inactivo';
  };
  onInputChange: (field: string, value: string) => void;
}

const NotesStatusSection: React.FC<NotesStatusSectionProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Observaciones y Estado</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="internalNotes">Observaciones Internas</Label>
          <Textarea
            id="internalNotes"
            value={formData.internalNotes}
            onChange={(e) => onInputChange('internalNotes', e.target.value)}
            placeholder="Notas internas sobre el cliente..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="status">Estado</Label>
          <Select value={formData.status} onValueChange={(value) => onInputChange('status', value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default NotesStatusSection;
