import type { ImageLoaderProps } from 'next/image';

// Only Unsplash goes through the Next/Vercel image optimizer.
// Uploaded images (/api/upload/[id]) are resized by our own route (?w=)
// and cached on the Vercel CDN; anything else (data: URLs, other hosts) is served as-is.
const isUnsplash = (src?: string) => !!src && src.startsWith('https://images.unsplash.com/');
const isUpload = (src?: string) => !!src && src.startsWith('/api/upload/');

const uploadLoader = ({ src, width }: ImageLoaderProps) => `${src}?w=${width}`;

// Spread onto <Image>: {...imageProps(src)}
export const imageProps = (src?: string) =>
  isUnsplash(src) ? {} : isUpload(src) ? { loader: uploadLoader } : { unoptimized: true };
