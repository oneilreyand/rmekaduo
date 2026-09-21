'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms/button';

export function TooltipButton({ direction }: { direction: 'Top' | 'Bottom' | 'Left' | 'Right' }) {
  const [isVisible, setIsVisible] = useState(false);
  return <span className="relative inline-flex" onBlur={() => setIsVisible(false)} onFocus={() => setIsVisible(true)} onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}><Button onClick={() => setIsVisible(!isVisible)} variant="secondary">Hover Me ({direction})</Button>{isVisible && <span className="absolute bottom-[calc(100%+0.5rem)] left-1/2 z-10 w-max -translate-x-1/2 rounded-lg bg-[#0f172a] px-2.5 py-1.5 text-xs text-white shadow-lg">Informasi tambahan</span>}</span>;
}
