import * as PIEXIF from 'piexifjs';

export const getImageOrientation = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const exifObj = PIEXIF.load(result);
        const orientation = exifObj['0th'][PIEXIF.ImageIFD.Orientation] || 1;
        resolve(orientation);
      } catch (error) {
        console.log('No EXIF data found, using default orientation');
        resolve(1); // Default orientation
      }
    };
    reader.readAsDataURL(file);
  });
};

export const getImageOrientationFromUrl = async (imageUrl: string): Promise<number> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], 'image', { type: blob.type });
    return await getImageOrientation(file);
  } catch (error) {
    console.log('Could not read orientation from URL, using default');
    return 1;
  }
};

export const getRotationFromOrientation = (orientation: number): number => {
  switch (orientation) {
    case 3:
      return 180;
    case 6:
      return 90;
    case 8:
      return 270;
    default:
      return 0;
  }
};

export const getTransformFromOrientation = (orientation: number): string => {
  const rotation = getRotationFromOrientation(orientation);
  if (rotation === 0) return '';
  
  return `rotate(${rotation}deg)`;
};

export const correctImageOrientation = async (file: File): Promise<File> => {
  const orientation = await getImageOrientation(file);
  
  if (orientation === 1) {
    return file; // No correction needed
  }

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas dimensions based on orientation
      if (orientation >= 5 && orientation <= 8) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      // Apply transformation based on orientation
      switch (orientation) {
        case 2:
          ctx?.transform(-1, 0, 0, 1, canvas.width, 0);
          break;
        case 3:
          ctx?.transform(-1, 0, 0, -1, canvas.width, canvas.height);
          break;
        case 4:
          ctx?.transform(1, 0, 0, -1, 0, canvas.height);
          break;
        case 5:
          ctx?.transform(0, 1, 1, 0, 0, 0);
          break;
        case 6:
          ctx?.transform(0, 1, -1, 0, canvas.width, 0);
          break;
        case 7:
          ctx?.transform(0, -1, -1, 0, canvas.width, canvas.height);
          break;
        case 8:
          ctx?.transform(0, -1, 1, 0, 0, canvas.height);
          break;
      }

      ctx?.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const correctedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: file.lastModified,
          });
          resolve(correctedFile);
        } else {
          resolve(file);
        }
      }, file.type, 0.95);
    };

    img.src = URL.createObjectURL(file);
  });
};