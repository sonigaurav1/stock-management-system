import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { cn } from '../../lib/utils';

interface SelectOption {
  value: string;
  label: string;
  _id?: string;
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

  const uniqueId = `select-${name}-${Math.random().toString(36).substr(2, 9)}`;
  const value = watch(name);

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
  };

  // Map the options to the correct format if they're using different keys
  const normalizedOptions = options.map((option) => {
    if (typeof option === 'object') {
      return {
        value: option[valueKey as keyof SelectOption] || option.value,
        label: option[labelKey as keyof SelectOption] || option.label
      };
    }
    return option;
  });

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
            'mb-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            required && "after:ml-0.5 after:text-[#EF4444] after:content-['*']",
            labelClassName
          )}
        >
          {label}
        </label>
      )}

      <div className='relative'>
        <Select
          onValueChange={handleValueChange}
          value={value}
          disabled={disabled}
        >
          <SelectTrigger
            id={uniqueId}
            className={cn(
              'w-full text-sm outline-none',
              errorMessage && 'border-[#EF4444]',
              selectClassName,
              className
            )}
            aria-invalid={!!errorMessage}
            aria-describedby={
              errorMessage
                ? `${uniqueId}-error`
                : hint
                  ? `${uniqueId}-hint`
                  : undefined
            }
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {normalizedOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
