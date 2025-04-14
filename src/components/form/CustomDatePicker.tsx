/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarClock } from 'lucide-react';

interface CustomDatePickerProps {
  name: string;
  required?: boolean;
  error?: string;
  className?: string;
  label?: string;
  defaultValue?: number;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  name,
  required,
  error,
  className,
  label,
  defaultValue
}) => {
  const {
    register,
    setValue,
    formState: { errors }
  } = useFormContext();
  const today = new Date();

  // Default to today + 7 days if no default value provided
  const initialValue =
    defaultValue || today.getTime() + 7 * 24 * 60 * 60 * 1000;

  // Initialize with the consistent value
  const [selectedDate, setSelectedDate] = useState<number | undefined>(
    initialValue
  );

  // Register field and set initial value once on mount with proper dependencies
  useEffect(() => {
    // Set initial value
    setValue(name, initialValue);

    return () => {
      // Clean up if needed
    };
  }, [name, required, register, setValue, initialValue]);

  // Error message from form validation or direct prop
  const errorMessage = error || errors[name]?.message?.toString();

  // Calculate days from today to selected date
  const daysFromToday = selectedDate
    ? Math.ceil((selectedDate - today.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className='flex flex-col gap-1.5'>
      {label && (
        <label className='mb-2 text-sm font-medium leading-none'>
          {label}
          {required && <span className='ml-0.5 text-[#EF4444]'>*</span>}
        </label>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground',
              className
            )}
          >
            {selectedDate ? (
              <>
                {format(selectedDate, 'MMMM d, yyyy')}
                {daysFromToday > 0 && (
                  <span className='ml-3'>
                    | <span className='mr-2' /> {daysFromToday} days
                  </span>
                )}
              </>
            ) : (
              'Select a date'
            )}
            <CalendarClock className='ml-auto size-4' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0'>
          <Calendar
            mode='single'
            selected={selectedDate ? new Date(selectedDate) : undefined}
            onSelect={(date) => {
              if (date) {
                const time = new Date(date).getTime();
                setSelectedDate(time);
                // Simply use the current timestamp when a date is selected
                setValue(name, time);
              }
            }}
            disabled={(date) => date < today}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {errorMessage && (
        <p className='text-sm font-medium text-[#EF4444]'>{errorMessage}</p>
      )}
    </div>
  );
};

export default CustomDatePicker;
