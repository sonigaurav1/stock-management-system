/* eslint-disable no-console */
import { useCallback, useState } from 'react';
import { maxSizeInMB } from '../constants';
import imageCompression from 'browser-image-compression';

const useCompressUploadedImage = () => {
  const [compressedFile, setCompressedFile] = useState<Blob | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const compressImage = useCallback(async (imageFile: File) => {
    console.log('originalFile instanceof Blob', imageFile instanceof Blob); // true
    console.log(`originalFile size ${imageFile.size / 1024 / 1024} MB`);
    console.log(
      `compress percentage: ${100 - (imageFile.size / 1024 / 1024) * 100}%`
    );

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
      console.log('compressedFile instanceof Blob', compressed instanceof Blob); // true
      console.log(`compressedFile size ${compressed.size / 1024 / 1024} MB`); // smaller than maxSizeMB

      setCompressedFile(compressed);
    } catch (err) {
      console.log(err);
      setError(err as Error);
    }
  }, []);

  return { compressedFile, error, compressImage };
};

export default useCompressUploadedImage;
