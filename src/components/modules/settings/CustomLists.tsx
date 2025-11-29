
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import TechnicalStepsSettings from './TechnicalStepsSettings';
import { Settings, ClipboardList } from 'lucide-react';

const CustomLists: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="shadow-sm border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Settings size={20} />
            Listas Personalizables
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Configura pasos técnicos, herramientas y materiales por categoría de servicio
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs defaultValue="technical-steps" className="w-full" orientation={isMobile ? "vertical" : "horizontal"}>
            {isMobile ? (
              <div className="space-y-4">
                <TabsList className="flex flex-col h-auto w-full bg-gray-50 p-1 rounded-lg">
                  <TabsTrigger 
                    value="technical-steps" 
                    className="w-full justify-start gap-3 px-4 py-3 text-left data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <ClipboardList size={16} />
                    <div className="text-left">
                      <div className="font-medium text-sm">Pasos Técnicos</div>
                      <div className="text-xs text-gray-500">Herramientas y materiales</div>
                    </div>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="technical-steps" className="mt-0">
                  <div className="bg-white rounded-lg border p-4">
                    <TechnicalStepsSettings />
                  </div>
                </TabsContent>
              </div>
            ) : (
              <>
                <ScrollArea className="w-full">
                  <TabsList className="grid w-full grid-cols-1 bg-gray-50 p-1 rounded-lg">
                    <TabsTrigger 
                      value="technical-steps" 
                      className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <ClipboardList size={16} />
                      <span className="font-medium">Pasos Técnicos y Herramientas</span>
                    </TabsTrigger>
                  </TabsList>
                </ScrollArea>
                
                <TabsContent value="technical-steps" className="mt-6">
                  <TechnicalStepsSettings />
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomLists;
