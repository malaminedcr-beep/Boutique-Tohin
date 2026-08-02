'use client';

import Image from 'next/image';
import { useState } from 'react';

type Props = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * next/image with a graceful fallback. If the source is missing (e.g. the art
 * has not been provided yet) it renders a clean neutral placeholder instead of
 * a broken image. The parent must be `position: relative` with a fixed ratio.
 */
export default function ImageWithFallback({
  src,
  alt,
  className,
  sizes,
  priority,
}: Props) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="flex h-full w-full items-center justify-center bg-[#F0EAE4]"
      >
        <svg
          className="h-12 w-12"
          fill="none"
          stroke="#C8BFBA"
          strokeWidth={1}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={`object-cover ${className ?? ''}`}
      onError={() => setError(true)}
    />
  );
}
