import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Copy, Send, User } from 'lucide-react';

interface ShareWithTechnicianDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  ticketNumber: string;
  assignedTo: string;
}

const ShareWithTechnicianDialog: React.FC<ShareWithTechnicianDialogProps> = ({
  isOpen,
  onClose,
  ticketId,
  ticketNumber,
  assignedTo,
}) => {
  const [shareUrl, setShareUrl] = useState('');
  const [technicianEmail, setTechnicianEmail] = useState('');
  const { toast } = useToast();

  const generateTechnicianLink = () => {
    // Generar link directo al ticket para técnicos
    const baseUrl = window.location.origin;
    const technicianUrl = `${baseUrl}/technician?ticket=${ticketId}`;
    setShareUrl(technicianUrl);
    
    toast({
      title: "Link generado",
      description: "Link para técnico generado correctamente",
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Copiado",
        description: "Link copiado al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el link",
        variant: "destructive",
      });
    }
  };

  const shareViaWhatsApp = () => {
    const message = `Hola, tienes un ticket asignado:

📋 Ticket: ${ticketNumber}
🔗 Acceder: ${shareUrl}

Por favor accede con tu cuenta para ver los detalles y actualizar el estado.`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const sendEmail = () => {
    const subject = `Ticket Asignado: ${ticketNumber}`;
    const body = `Hola,

Tienes un nuevo ticket asignado:

Ticket: ${ticketNumber}
Link de acceso: ${shareUrl}

Por favor accede con tu cuenta para ver los detalles y actualizar el estado.

Saludos`;

    const mailtoUrl = `mailto:${technicianEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Compartir con Técnico
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Ticket:</strong> {ticketNumber}<br/>
              <strong>Asignado a:</strong> {assignedTo}
            </p>
          </div>

          <div>
            <Label>Email del Técnico (opcional)</Label>
            <Input
              type="email"
              placeholder="email@ejemplo.com"
              value={technicianEmail}
              onChange={(e) => setTechnicianEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Button 
              onClick={generateTechnicianLink}
              className="w-full"
              variant="default"
            >
              Generar Link para Técnico
            </Button>
          </div>

          {shareUrl && (
            <div className="space-y-3">
              <div>
                <Label>Link generado:</Label>
                <div className="flex gap-2 mt-1">
                  <Input 
                    value={shareUrl} 
                    readOnly 
                    className="text-sm"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline"
                  onClick={shareViaWhatsApp}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  WhatsApp
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={sendEmail}
                  disabled={!technicianEmail}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Email
                </Button>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground p-3 bg-gray-50 rounded">
            <strong>Nota:</strong> El técnico debe iniciar sesión con su cuenta para acceder al ticket.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareWithTechnicianDialog;