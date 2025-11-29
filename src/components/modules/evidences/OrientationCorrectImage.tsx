import React, { useState, useEffect } from 'react';
import { getImageOrientationFromUrl, getTransformFromOrientation } from '@/utils/evidence/imageOrientation';

interface OrientationCorrectImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  manualRotation?: number;
}

const OrientationCorrectImage: React.FC<OrientationCorrectImageProps> = ({
  src,
  alt,
  className = '',
  onLoad,
  manualRotation = 0
}) => {
  const [transform, setTransform] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const correctOrientation = async () => {
      try {
        const orientation = await getImageOrientationFromUrl(src);
        const transformCSS = getTransformFromOrientation(orientation);
        setTransform(transformCSS);
      } catch (error) {
        console.log('Could not read image orientation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    correctOrientation();
  }, [src]);

  const handleImageLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-transform ${className}`}
        style={{ transform: `${transform} rotate(${manualRotation}deg)` }}
        onLoad={handleImageLoad}
        onError={() => setIsLoading(false)}
      />
    </div>
  );
};

export default OrientationCorrectImage;