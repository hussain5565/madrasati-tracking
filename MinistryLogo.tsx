import React from 'react';

interface MinistryLogoProps {
  className?: string;
  imgClassName?: string;
  size?: number; // Optional fixed height in pixels
  showFallbackText?: boolean;
}

export const MinistryLogo: React.FC<MinistryLogoProps> = ({ 
  className = "", 
  imgClassName = "",
  size,
}) => {
  return (
    <div className={`inline-flex items-center justify-center h-full ${className}`}>
      {/* Official Saudi Ministry of Education Logo from uploaded attachment */}
      <img
        src="/assets/aistudio/IMG_7590_1b972fe9.png"
        alt="شعار وزارة التعليم - المملكة العربية السعودية"
        style={size ? { height: `${size}px`, maxHeight: `${size}px` } : undefined}
        className={`w-auto h-full max-h-full object-contain filter drop-shadow-xs transition-transform duration-200 select-none ${imgClassName}`}
        loading="eager"
      />
    </div>
  );
};
