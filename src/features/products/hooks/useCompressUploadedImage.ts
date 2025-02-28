'use client';

import { useCallback, useState } from 'react';
import { maxSizeInMB } from '../constants';
import imageCompression from 'browser-image-compression';

const useCompressUploadedImage = () => {
  const [compressedFile, setCompressedFile] = useState<Blob | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const compressImage = useCallback(async (imageFile: File) => {
    const options = {
      maxSizeMB: maxSizeInMB,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      maxIteration: 10, // Maximum number of iterations to compress the image
      initialQuality: 0.8, // Initial quality value between 0 and 1
      alwaysKeepResolution: false, // If true, always keep the resolution of the original image
      fileType: 'image/webp' // Convert to WebP format
    };

    try {
      const compressed = await imageCompression(imageFile, options);
      setCompressedFile(compressed);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(err as Error);
    }
  }, []);

  return { compressedFile, error, compressImage };
};

export default useCompressUploadedImage;
