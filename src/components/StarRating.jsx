import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating, onRatingChange, readOnly = false, size = 'md' }) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readOnly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  // Tamaños de estrella
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((value) => {
        const isFilled = value <= (hoverRating || rating);
        
        return (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            disabled={readOnly}
            className={`transition-all duration-200 ${
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            }`}
          >
            <Star
              className={`${sizes[size]} ${
                isFilled 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-600'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}