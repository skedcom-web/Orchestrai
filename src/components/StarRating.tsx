import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readonly = false,
  size = 'md',
  label,
}) => {
  const [hovered, setHovered] = useState(0);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const active = hovered || value;

  return (
    <div className="space-y-1.5">
      {label && (
        <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          {label}
        </span>
      )}
      <div
        className="flex items-center gap-1"
        role="group"
        aria-label={label || 'Star rating'}
        onMouseLeave={() => !readonly && setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= active;
          return (
            <button
              key={star}
              type="button"
              disabled={readonly}
              aria-label={`${star} star${star !== 1 ? 's' : ''}`}
              className={`transition-all duration-150 ${
                readonly ? 'cursor-default' : 'cursor-pointer hover:scale-125'
              }`}
              onClick={() => !readonly && onChange?.(star)}
              onMouseEnter={() => !readonly && setHovered(star)}
            >
              <Star
                className={`${sizeClasses[size]} transition-colors duration-150 ${
                  filled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                    : 'text-[var(--border-color)] hover:text-amber-300'
                }`}
              />
            </button>
          );
        })}
        {value > 0 && (
          <span className="ml-1 text-[11px] font-bold text-amber-400">
            {value}/5
          </span>
        )}
      </div>
    </div>
  );
};
