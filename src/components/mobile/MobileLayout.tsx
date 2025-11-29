import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOrientation } from '@/hooks/useOrientation';
import MobileHeader from './MobileHeader';
import MobileNavigation from './MobileNavigation';

interface MobileLayoutProps {
  children: React.ReactNode;
  activeModule: string;
  onModuleSelect: (module: string) => void;
  userRole?: 'admin' | 'technician' | 'manager';
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  activeModule,
  onModuleSelect,
  userRole = 'admin'
}) => {
  const orientation = useOrientation();
  const isLandscape = orientation === 'landscape';
  
  return (
    <div className={`min-h-screen bg-background flex ${isLandscape ? 'flex-row' : 'flex-col'} w-full`}>
      {!isLandscape && <MobileHeader activeModule={activeModule} userRole={userRole} />}
      
      <main className={`flex-1 overflow-y-auto ${isLandscape ? 'pb-0' : 'pb-20'}`}>
        <div className={`container mx-auto max-w-full ${isLandscape ? 'px-2 py-2 h-screen overflow-y-auto' : 'px-4 py-4'}`}>
          {children}
        </div>
      </main>
      
      <MobileNavigation
        activeModule={activeModule}
        onModuleSelect={onModuleSelect}
        userRole={userRole}
        isLandscape={isLandscape}
      />
    </div>
  );
};

export default MobileLayout;