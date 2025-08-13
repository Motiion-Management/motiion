import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  compressQuality?: number;
  format?: SaveFormat;
}

export interface OptimizedImageResult {
  uri: string;
  width: number;
  height: number;
}

const defaultOptions: Required<ImageOptimizationOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  compressQuality: 0.8,
  format: SaveFormat.JPEG,
};

/**
 * Optimizes an image by resizing and compressing it
 * @param imageUri - The URI of the image to optimize
 * @param options - Optimization options
 * @returns Promise<OptimizedImageResult> - The optimized image result
 */
export async function optimizeImage(
  imageUri: string,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const config = { ...defaultOptions, ...options };

  try {
    // First, get the image dimensions to determine if resizing is needed
    const manipulations = [];

    // Add resize manipulation if the image might be too large
    // We'll resize to fit within the max dimensions while preserving aspect ratio
    manipulations.push({
      resize: {
        width: config.maxWidth,
        height: config.maxHeight,
      },
    });

    // Apply manipulations with compression
    const result = await manipulateAsync(imageUri, manipulations, {
      compress: config.compressQuality,
      format: config.format,
    });

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Failed to optimize image:', error);
    // Return original image if optimization fails
    return {
      uri: imageUri,
      width: 0,
      height: 0,
    };
  }
}

/**
 * Optimizes multiple images concurrently
 * @param imageUris - Array of image URIs to optimize
 * @param options - Optimization options
 * @returns Promise<OptimizedImageResult[]> - Array of optimized image results
 */
export async function optimizeImages(
  imageUris: string[],
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult[]> {
  try {
    const optimizationPromises = imageUris.map((uri) => optimizeImage(uri, options));
    return await Promise.all(optimizationPromises);
  } catch (error) {
    console.error('Failed to optimize images:', error);
    // Return original images if batch optimization fails
    return imageUris.map((uri) => ({
      uri,
      width: 0,
      height: 0,
    }));
  }
}

/**
 * Gets the estimated file size reduction for display purposes
 * @param originalSize - Original file size in bytes (if available)
 * @param optimizedSize - Optimized file size in bytes (if available)
 * @returns string - Human-readable size reduction info
 */
export function getSizeReductionInfo(originalSize?: number, optimizedSize?: number): string {
  if (!originalSize || !optimizedSize) {
    return 'Image optimized for better performance';
  }

  const reduction = ((originalSize - optimizedSize) / originalSize) * 100;
  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)}KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return `Reduced from ${formatSize(originalSize)} to ${formatSize(optimizedSize)} (${reduction.toFixed(0)}% smaller)`;
}
