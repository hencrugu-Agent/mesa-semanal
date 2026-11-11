import React from 'react';

interface DishIllustrationProps {
  imageKey: string;
  alt: string;
  className?: string;
}

export function DishIllustration({ imageKey, alt, className = '' }: DishIllustrationProps) {
  const svgPath = `/images/dishes/${imageKey}.svg`;

  return (
    <div className={`relative overflow-hidden bg-[#FAF6EE] flex items-center justify-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={svgPath}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        loading="lazy"
        onError={(e) => {
          // Fallback a un plato genérico en caso de que alguna clave falle
          (e.target as HTMLImageElement).src = '/images/dishes/lentejas.svg';
        }}
      />
    </div>
  );
}
