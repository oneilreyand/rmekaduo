'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/atoms/input';

export function PasswordInput() {
  const [isVisible, setIsVisible] = useState(false);
  return <label className="relative block w-full max-w-md"><span className="ui-heading mb-1 block text-sm font-semibold">Kata sandi</span><Input className="pr-11" placeholder="Masukkan kata sandi" type={isVisible ? 'text' : 'password'} /><button aria-label={isVisible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} className="ui-icon-button absolute bottom-1.5 right-1.5 grid h-7 w-7 place-items-center rounded-lg border-0" onClick={() => setIsVisible(!isVisible)} type="button">{isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></label>;
}
