import React, { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

interface Props {
  defaultValue?: string;
  name: string;
  placeHolder: string;
  type?: string;
  required?: boolean;
  style?: string;
  classNames?: string;
  label?: string;
  placeholderColor?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  className?: string;
  error?: string;
  hint?: string;
  hintClassName?: string;
  showPasswordToggle?: boolean;
  onIconClick?: () => void;
  disabled?: boolean;
  ref?: React.Ref<HTMLInputElement>;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomInput: React.FC<Props> = ({
  defaultValue,
  name,
  placeHolder,
  type: initialType = 'text',
  required,
  style,
  classNames,
  label,
  placeholderColor = '#fff',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  containerClassName,
  labelClassName,
  inputClassName,
  className,
  error,
  hint,
  hintClassName,
  showPasswordToggle = false,
  onIconClick,
  disabled = false,
  ref,
  ...props
}) => {
  const {
    register,
    formState: { errors },
    setValue,
    clearErrors
  } = useFormContext();

  const [type, setType] = useState(initialType);
  const inputRef = useRef<HTMLInputElement>(null);
  const uniqueId = `input-${name}-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    if (defaultValue) {
      setValue(name, defaultValue);
    }
  }, [defaultValue, name, setValue]);

  const togglePasswordVisibility = () => {
    setType(type === 'password' ? 'text' : 'password');
  };

  const handleLabelClick = () => {
    inputRef.current?.focus();
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  const validationRules: {
    [key: string]: string | { value: RegExp; message: string };
  } = {};

  if (required) {
    validationRules.required = 'This field is required';
  }

  if (initialType === 'email') {
    validationRules.pattern = {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email address'
    };
  }

  const {
    onChange,
    onBlur: registerOnBlur,
    ref: registerRef,
    ...registerRest
  } = register(name, validationRules);

  // Use form errors or passed error prop
  const errorMessage = error || errors[name]?.message?.toString();

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
          onClick={handleLabelClick}
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
        {icon && iconPosition === 'left' && (
          <div
            onClick={onIconClick}
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2',
              onIconClick && 'cursor-pointer'
            )}
          >
            {icon}
          </div>
        )}

        <Input
          {...props}
          ref={ref || registerRef || inputRef}
          id={uniqueId}
          type={type}
          disabled={disabled}
          aria-invalid={!!errorMessage}
          aria-describedby={
            errorMessage
              ? `${uniqueId}-error`
              : hint
                ? `${uniqueId}-hint`
                : undefined
          }
          placeholder={placeHolder}
          className={cn(
            'w-full bg-transparent text-sm outline-none',
            icon && iconPosition === 'left' && 'pl-10',
            (icon || showPasswordToggle) && iconPosition === 'right' && 'pr-10',
            errorMessage && 'border-[#EF4444]',
            inputClassName,
            className
          )}
          onChange={(e) => {
            // Use the custom onChange prop if provided, otherwise fallback to default behavior
            if (props.onChange) {
              props.onChange(e);
            } else {
              onChange(e);
            }
            if (errors[name]) {
              clearErrors(name);
            }
          }}
          onFocus={handleFocus}
          onBlur={(e) => {
            registerOnBlur?.(e);
            handleBlur(e);
          }}
          {...registerRest}
        />

        {((icon && iconPosition === 'right') ||
          (showPasswordToggle && initialType === 'password')) && (
          <div
            onClick={
              initialType === 'password'
                ? togglePasswordVisibility
                : onIconClick
            }
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              (onIconClick || showPasswordToggle) && 'cursor-pointer'
            )}
          >
            {initialType === 'password' && showPasswordToggle ? (
              type === 'password' ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )
            ) : (
              icon
            )}
          </div>
        )}
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

export default CustomInput;
