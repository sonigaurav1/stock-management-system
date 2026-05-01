import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '../../lib/utils';
import { Check, Info } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import CustomTooltip from '../ui/custom/CustomTooltip';

interface SelectOption {
  value: string;
  label: string;
  _id?: string;
  [key: string]: any;
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
  tooltipContent?: string;
  showTooltip?: boolean;
  // Dynamic trailing component (e.g., add category, add supplier)
  trailingComponent?: React.ReactNode;
  trailingComponentPosition?: 'top' | 'bottom';
  // Search functionality
  searchable?: boolean;
  searchPlaceholder?: string;
  // Custom icon for selected item
  selectedIcon?: React.ReactNode;
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
  labelKey = 'name',
  tooltipContent,
  showTooltip = true,
  trailingComponent,
  trailingComponentPosition = 'top',
  searchable = true,
  searchPlaceholder = 'Search options...',
  selectedIcon
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
  const [searchQuery, setSearchQuery] = useState('');

  // Map the options to the correct format
  const normalizedOptions = options.map((option) => ({
    value: String(option[valueKey] || option.value || ''),
    label: String(option[labelKey] || option.label || '')
  }));

  // Filter options based on search query
  const filteredOptions = searchQuery
    ? normalizedOptions.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : normalizedOptions;

  // Find the selected option label
  const selectedOption = normalizedOptions.find(
    (option) => option.value === value
  );

  useEffect(() => {
    if (defaultValue) {
      setValue(name, defaultValue);
    }
  }, [defaultValue, name, setValue]);

  const handleValueChange = (newValue: string) => {
    setValue(name, newValue);
    if (errors[name]) {
      clearErrors(name);
    }
    setOpen(false);
    setSearchQuery('');
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
      {/* Label Row */}
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-1'>
          {label && (
            <label
              htmlFor={uniqueId}
              className={cn(
                'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                labelClassName
              )}
            >
              {label}
              {required && <span className='ml-0.5 text-[#EF4444]'>*</span>}
            </label>
          )}
          {showTooltip && tooltipContent && (
            <CustomTooltip tooltipContent={tooltipContent} side='right'>
              <Info className='h-4 w-4 cursor-help text-muted-foreground' />
            </CustomTooltip>
          )}
        </div>
        {trailingComponentPosition === 'top' && trailingComponent}
      </div>

      {/* Select Button */}
      <div className='relative'>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              id={uniqueId}
              type='button'
              disabled={disabled}
              className={cn(
                'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                errorMessage && 'border-red-500 focus:ring-red-500',
                selectClassName,
                className
              )}
            >
              <span
                className={cn(
                  'flex items-center gap-2',
                  !value && 'text-muted-foreground'
                )}
              >
                {selectedIcon && value && (
                  <span className='shrink-0'>{selectedIcon}</span>
                )}
                <span className={cn(!value && 'text-muted-foreground')}>
                  {selectedOption?.label || placeholder}
                </span>
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
                className='h-4 w-4 shrink-0 opacity-50'
              >
                <path d='m6 9 6 6 6-6' />
              </svg>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className='w-[--radix-popover-trigger-width] p-0'
            align='start'
          >
            {/* Search Input */}
            {searchable && (
              <div className='flex items-center border-b px-3'>
                <Command className='flex-1'>
                  <CommandInput
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    className='h-9 border-0 bg-transparent focus:outline-none focus:ring-0'
                  />
                </Command>
              </div>
            )}
            <Command className='max-h-[200px] overflow-auto'>
              <CommandEmpty className='py-6 text-center text-sm text-muted-foreground'>
                No option found.
              </CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => (
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

      {/* Trailing Component at Bottom */}
      {trailingComponentPosition === 'bottom' && trailingComponent}

      {/* Error Message */}
      {errorMessage && (
        <p
          id={`${uniqueId}-error`}
          className='text-sm font-medium text-red-500'
        >
          {errorMessage}
        </p>
      )}

      {/* Hint */}
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
