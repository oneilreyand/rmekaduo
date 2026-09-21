'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/atoms/input';

export function PasswordInput() {
  const [isVisible, setIsVisible] = useState(false);
  return <label className="relative block w-full max-w-md"><span className="mb-1 block text-sm font-semibold text-stone-700">Password (with Toggle)</span><Input className="pr-11" placeholder="Password" type={isVisible ? 'text' : 'password'} /><button aria-label={isVisible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} className="absolute bottom-1.5 right-1.5 grid h-7 w-7 place-items-center rounded-lg text-stone-500 hover:bg-stone-100" onClick={() => setIsVisible(!isVisible)} type="button">{isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></label>;
}
