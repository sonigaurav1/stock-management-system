'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Country {
  code: string;
  name: string;
  flag: string;
  phone: string;
}

const COUNTRIES: Country[] = [
  { code: 'IN', name: 'Nepal', flag: '🇮🇳', phone: '+91' },
  { code: 'US', name: 'United States', flag: '🇺🇸', phone: '+1' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', phone: '+44' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', phone: '+1' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', phone: '+61' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', phone: '+64' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', phone: '+65' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', phone: '+60' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', phone: '+63' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', phone: '+66' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', phone: '+84' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', phone: '+62' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', phone: '+880' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', phone: '+92' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', phone: '+94' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', phone: '+977' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', phone: '+49' },
  { code: 'FR', name: 'France', flag: '🇫🇷', phone: '+33' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', phone: '+39' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', phone: '+34' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', phone: '+31' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', phone: '+32' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', phone: '+41' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', phone: '+46' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', phone: '+47' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', phone: '+45' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', phone: '+971' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', phone: '+966' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', phone: '+27' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', phone: '+52' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', phone: '+55' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', phone: '+54' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', phone: '+81' },
  { code: 'CN', name: 'China', flag: '🇨🇳', phone: '+86' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', phone: '+82' }
];

interface PhoneInputWithCountryProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Get default country - synchronous to avoid CORS and rate limiting issues
const getDefaultCountry = (): string => {
  return 'NP'; // Default to Nepal
};

export default function PhoneInputWithCountry({
  value,
  onChange,
  placeholder = 'Enter your phone number',
  className,
  disabled = false
}: PhoneInputWithCountryProps) {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Initialize with default country on mount
  useEffect(() => {
    const defaultCountryCode = getDefaultCountry();
    const country = COUNTRIES.find((c) => c.code === defaultCountryCode);
    if (country) {
      setSelectedCountry(country);
    } else {
      setSelectedCountry(COUNTRIES[15]); // Nepal
    }
  }, []);

  // Sync incoming value prop with local phoneNumber state
  // Extract just the phone number without country code
  useEffect(() => {
    if (!selectedCountry) return;

    if (value) {
      let phoneNum = value;
      // If value starts with country code, remove it
      if (value.startsWith(selectedCountry.phone)) {
        phoneNum = value.replace(selectedCountry.phone, '');
      }
      // Remove any non-numeric characters
      phoneNum = phoneNum.replace(/[^\d]/g, '');
      setPhoneNumber(phoneNum);
    } else {
      setPhoneNumber('');
    }
  }, [value, selectedCountry]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setOpen(false);
    // Update the full phone value with country code
    updatePhoneValue(phoneNumber, country);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    // Remove non-numeric characters except leading +
    inputValue = inputValue.replace(/[^\d]/g, '');
    setPhoneNumber(inputValue);
    updatePhoneValue(inputValue, selectedCountry);
  };

  const updatePhoneValue = (phone: string, country: Country | null) => {
    if (country && phone) {
      const fullPhoneValue = `${country.phone}${phone}`;
      onChange(fullPhoneValue);
    } else {
      onChange(phone);
    }
  };

  return (
    <div className={cn('flex gap-2', className)}>
      {/* Country Selector */}
      <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className='h-10 w-fit min-w-[120px] justify-between px-3'
            role='combobox'
            aria-expanded={open}
            disabled={disabled}
          >
            <div className='flex items-center gap-2'>
              {selectedCountry && (
                <>
                  <span className='text-lg'>{selectedCountry.flag}</span>
                  <span className='text-xs font-medium'>
                    {selectedCountry.phone}
                  </span>
                </>
              )}
            </div>
            <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[280px] p-0' align='start'>
          <Command
            filter={(value, search) => {
              const country = COUNTRIES.find((c) => c.code === value);
              if (!country) return 0;

              // Search by country name or code or phone
              if (
                country.name.toLowerCase().includes(search.toLowerCase()) ||
                country.code.toLowerCase().includes(search.toLowerCase()) ||
                country.phone.includes(search)
              ) {
                return 1;
              }
              return 0;
            }}
          >
            <CommandInput placeholder='Search country...' />
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {COUNTRIES.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={country.code}
                    onSelect={() => handleCountrySelect(country)}
                  >
                    <div className='flex w-full items-center gap-3 py-1'>
                      <span className='text-lg'>{country.flag}</span>
                      <div className='flex flex-1 flex-col'>
                        <span className='text-sm font-medium'>
                          {country.name}
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          {country.phone}
                        </span>
                      </div>
                      {selectedCountry?.code === country.code && (
                        <span className='text-primary'>✓</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Phone Input */}
      <Input
        type='tel'
        placeholder={placeholder}
        value={phoneNumber}
        onChange={handlePhoneChange}
        className='h-10 flex-1'
        inputMode='numeric'
        disabled={disabled}
      />
    </div>
  );
}
