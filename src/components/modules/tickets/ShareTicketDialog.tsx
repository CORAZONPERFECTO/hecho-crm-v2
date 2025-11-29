
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clipboard, Share2, MessageCircle } from 'lucide-react';
import { useSharedLinks } from '@/hooks/useSharedLinks';
import { useToast } from '@/hooks/use-toast';

interface ShareTicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  ticketNumber: string;
  currentUser: string;
}

const ShareTicketDialog: React.FC<ShareTicketDialogProps> = ({
  isOpen,
  onClose,
  ticketId,
  ticketNumber,
  currentUser
}) => {
  const [shareUrl, setShareUrl] = useState('');
  const [expirationHours, setExpirationHours] = useState<string>('24');
  const { loading, generateShareLink } = useSharedLinks();
  const { toast } = useToast();

  const handleGenerateLink = async () => {
    try {
      const hours = expirationHours === 'never' ? undefined : parseInt(expirationHours);
      const result = await generateShareLink(ticketId, currentUser, hours);
      setShareUrl(result.share_url);
    } catch (error) {
      console.error('Error generating link:', error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Éxito",
        description: "Link copiado al portapapeles"
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const shareViaWhatsApp = () => {
    const message = `Hola! Te comparto el link del ticket ${ticketNumber} para que puedas trabajar en él: ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const resetDialog = () => {
    setShareUrl('');
    setExpirationHours('24');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 size={20} />
            Compartir Ticket {ticketNumber}
          </DialogTitle>
          <DialogDescription>
            Genera un link seguro para compartir este ticket con técnicos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!shareUrl ? (
            <>
              <div>
                <Label htmlFor="expiration">Expiración del Link</Label>
                <Select value={expirationHours} onValueChange={setExpirationHours}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar expiración" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hora</SelectItem>
                    <SelectItem value="4">4 horas</SelectItem>
                    <SelectItem value="8">8 horas</SelectItem>
                    <SelectItem value="24">24 horas</SelectItem>
                    <SelectItem value="72">3 días</SelectItem>
                    <SelectItem value="168">1 semana</SelectItem>
                    <SelectItem value="never">Sin expiración</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerateLink} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Generando...' : 'Generar Link Compartible'}
              </Button>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="share-url">Link Generado</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="share-url"
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button size="sm" variant="outline" onClick={copyToClipboard}>
                    <Clipboard size={16} />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={shareViaWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700">
                  <MessageCircle size={16} className="mr-2" />
                  Enviar por WhatsApp
                </Button>
                <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                  <Clipboard size={16} className="mr-2" />
                  Copiar Link
                </Button>
              </div>

              <div className="text-sm text-gray-500 text-center">
                {expirationHours === 'never' 
                  ? 'Este link no expira'
                  : `Este link expira en ${expirationHours} hora(s)`
                }
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetDialog}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareTicketDialog;
