import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react'; // Import icons
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '../ui/command'; // Import Command components
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'; // Import Popover components

interface SelectOption {
  value: string;
  label: string;
  _id?: string;
  [key: string]: any; // Allow for dynamic keys
}

interface Props {
  name: string;
  placeholder: string;
  options: SelectOption[];
  defaultValue?: string;
  required?: boolean;
  label?: string;
  fullWidth?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  className?: string;
  error?: string;
  hint?: string;
  hintClassName?: string;
  disabled?: boolean;
  valueKey?: string;
  labelKey?: string;
}

const CustomSelect: React.FC<Props> = ({
  name,
  placeholder,
  options,
  defaultValue,
  required,
  label,
  fullWidth = false,
  containerClassName,
  labelClassName,
  selectClassName,
  className,
  error,
  hint,
  hintClassName,
  disabled = false,
  valueKey = '_id',
  labelKey = 'name'
}) => {
  const {
    register,
    formState: { errors },
    setValue,
    clearErrors,
    watch
  } = useFormContext();

  const uniqueId = `select-${name}`;
  const value = watch(name);
  const [open, setOpen] = useState(false);

  // Map the options to the correct format
  const normalizedOptions = options.map((option) => ({
    value: String(option[valueKey] || option.value || ''),
    label: String(option[labelKey] || option.label || '')
  }));

  // Find the selected option label
  const selectedOption = normalizedOptions.find(
    (option) => option.value === value
  );

  useEffect(() => {
    if (defaultValue) {
      setValue(name, defaultValue);
    }
  }, [defaultValue, name, setValue]);

  const handleValueChange = (value: string) => {
    setValue(name, value);
    if (errors[name]) {
      clearErrors(name);
    }
    setOpen(false);
  };

  // Use form errors or passed error prop
  const errorMessage = error || errors[name]?.message?.toString();

  // Register the field
  register(name, {
    required: required ? 'This field is required' : false
  });

  return (
    <div
      className={cn(
        'flex flex-col gap-1.5',
        fullWidth && 'w-full',
        containerClassName
      )}
    >
      {label && (
        <label
          htmlFor={uniqueId}
          className={cn(
            'mb-2 max-w-max text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            required && "after:ml-0.5 after:text-[#EF4444] after:content-['*']",
            labelClassName
          )}
        >
          {label}
        </label>
      )}

      <div className='relative'>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              id={uniqueId}
              type='button'
              disabled={disabled}
              className={cn(
                'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                errorMessage && 'border-[#EF4444]',
                selectClassName,
                className
              )}
              aria-describedby={
                errorMessage
                  ? `${uniqueId}-error`
                  : hint
                    ? `${uniqueId}-hint`
                    : undefined
              }
            >
              <span className={!value ? 'text-muted-foreground' : ''}>
                {selectedOption?.label || placeholder}
              </span>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='h-4 w-4 opacity-50'
              >
                <path d='m6 9 6 6 6-6' />
              </svg>
            </button>
          </PopoverTrigger>
          <PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
            <Command>
              <CommandInput placeholder='Search options...' className='h-9' />
              <CommandEmpty>No option found.</CommandEmpty>
              <CommandGroup className='max-h-64 overflow-auto'>
                {normalizedOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleValueChange(option.value)}
                    className='cursor-pointer'
                  >
                    {option.label}
                    {option.value === value && (
                      <Check className='ml-auto h-4 w-4' />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {errorMessage && (
        <p
          id={`${uniqueId}-error`}
          className='text-sm font-medium text-[#EF4444]'
        >
          {errorMessage}
        </p>
      )}

      {hint && !errorMessage && (
        <p
          id={`${uniqueId}-hint`}
          className={cn('text-sm text-muted-foreground', hintClassName)}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default CustomSelect;
