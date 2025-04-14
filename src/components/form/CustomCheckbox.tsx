import React, { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Info } from 'lucide-react';
// eslint-disable-next-line import/no-unresolved
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';

interface Props {
  defaultChecked?: boolean;
  name: string;
  label: string;
  required?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  checkboxClassName?: string;
  className?: string;
  error?: string;
  hint?: string;
  hintClassName?: string;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  conditionalContent?: React.ReactNode;
  description?: string;
  descriptionClassName?: string;
  infoTooltip?: string;
  ref?: React.Ref<HTMLButtonElement>;
  onFocus?: (e: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLButtonElement>) => void;
}

const CustomCheckbox: React.FC<Props> = ({
  defaultChecked,
  name,
  label,
  required,
  containerClassName,
  labelClassName,
  checkboxClassName,
  className,
  error,
  hint,
  hintClassName,
  disabled = false,
  onCheckedChange,
  conditionalContent,
  description,
  descriptionClassName,
  infoTooltip,
  ref,
  ...props
}) => {
  const {
    register,
    formState: { errors },
    setValue,
    clearErrors,
    watch
  } = useFormContext();

  // Use a local state to ensure the checkbox visually updates immediately
  const [isCheckedLocal, setIsCheckedLocal] = useState<boolean>(
    defaultChecked || false
  );

  // Watch the form value for external changes
  const formValue = watch(name);

  const checkboxRef = useRef<HTMLButtonElement>(null);
  const uniqueId = `checkbox-${name}-${Math.random().toString(36).substr(2, 9)}`;

  // Synchronize the form value with the local state
  useEffect(() => {
    if (formValue !== undefined) {
      setIsCheckedLocal(!!formValue);
    }
  }, [formValue]);

  // Set the initial form value if defaultChecked is provided
  useEffect(() => {
    if (defaultChecked !== undefined) {
      setValue(name, defaultChecked);
      setIsCheckedLocal(defaultChecked);
    }
  }, [defaultChecked, name, setValue]);

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  const validationRules: {
    [key: string]: any;
  } = {};

  if (required) {
    validationRules.required = 'This field is required';
  }

  const {
    ref: registerRef,
    onBlur: registerOnBlur,
    ...registerRest
  } = register(name, validationRules);

  // Use form errors or passed error prop
  const errorMessage = error || errors[name]?.message?.toString();

  const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
    // Update the local state immediately for responsive UI
    setIsCheckedLocal(checked === true);

    // Update the form value
    setValue(name, checked === true, { shouldValidate: true });

    // Clear errors if any
    if (errors[name]) {
      clearErrors(name);
    }

    // Call the onCheckedChange callback if provided
    if (onCheckedChange) {
      onCheckedChange(checked === true);
    }
  };

  // Modified label click handler to properly trigger the checkbox
  const handleLabelClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default to avoid focus issues

    if (!disabled) {
      // Create a new checked value
      const newValue = !isCheckedLocal;

      // Update local state
      setIsCheckedLocal(newValue);

      // Update form value
      setValue(name, newValue, { shouldValidate: true });

      // Clear errors if any
      if (errors[name]) {
        clearErrors(name);
      }

      // Call the onCheckedChange callback if provided
      if (onCheckedChange) {
        onCheckedChange(newValue);
      }

      // Programmatically click the checkbox if we have a ref to it
      if (checkboxRef.current) {
        checkboxRef.current.click();
      }
    }
  };

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      <div className='flex items-start space-x-2'>
        <Checkbox
          {...props}
          ref={(e) => {
            // Handle refs properly
            if (e) {
              if (typeof registerRef === 'function') registerRef(e);
              if (ref && typeof ref === 'function') ref(e);
              checkboxRef.current = e;
            }
          }}
          id={uniqueId}
          checked={isCheckedLocal}
          disabled={disabled}
          className={cn(
            errorMessage && 'border-[#EF4444]',
            checkboxClassName,
            className
          )}
          onCheckedChange={handleCheckboxChange}
          aria-invalid={!!errorMessage}
          aria-describedby={
            errorMessage
              ? `${uniqueId}-error`
              : hint
                ? `${uniqueId}-hint`
                : undefined
          }
          onFocus={handleFocus}
          onBlur={(e) => {
            if (registerOnBlur) registerOnBlur(e);
            handleBlur(e);
          }}
          {...registerRest}
        />
        <div className='grid gap-1.5 leading-none'>
          <div className='flex items-center gap-1'>
            <label
              htmlFor={uniqueId}
              className={cn(
                'cursor-pointer select-none text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                required &&
                  "after:ml-0.5 after:text-[#EF4444] after:content-['*']",
                labelClassName
              )}
              onClick={handleLabelClick}
            >
              {label}
            </label>
            {infoTooltip && (
              <div className='group relative'>
                <Info size={14} className='cursor-help text-muted-foreground' />
                <div className='invisible absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded-md bg-black p-2 text-xs text-white opacity-0 transition-opacity group-hover:visible group-hover:opacity-100'>
                  {infoTooltip}
                  <div className='absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-black'></div>
                </div>
              </div>
            )}
          </div>

          {description && (
            <p
              className={cn(
                'text-sm text-muted-foreground',
                descriptionClassName
              )}
            >
              {description}
            </p>
          )}
        </div>
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

      {isCheckedLocal && conditionalContent && (
        <div className='mt-3 transition-all duration-200 ease-in-out'>
          {conditionalContent}
        </div>
      )}
    </div>
  );
};

export default CustomCheckbox;
