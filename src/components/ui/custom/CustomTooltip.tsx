import { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../tooltip';
import { cn } from '../../../lib/utils';

interface CustomTooltipProps {
  children?: ReactNode;
  triggerElement?: ReactNode;
  tooltipContent: ReactNode | string;
  delayDuration?: number;
  asChild?: boolean;
  side?: 'right' | 'left' | 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  contentClassName?: string;
  triggerClassName?: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  sideOffset?: number;
  alignOffset?: number;
}

const CustomTooltip = ({
  children,
  triggerElement,
  tooltipContent,
  delayDuration = 200,
  asChild = false,
  side = 'top',
  align = 'center',
  contentClassName,
  triggerClassName,
  defaultOpen,
  onOpenChange,
  disabled = false,
  sideOffset = 4,
  alignOffset = 0
}: CustomTooltipProps) => {
  // Support both children and triggerElement for backwards compatibility
  const trigger = triggerElement || children;

  if (!trigger || !tooltipContent) {
    // eslint-disable-next-line no-console
    console.warn(
      'CustomTooltip: triggerElement/children and tooltipContent are required'
    );
    return null;
  }

  if (disabled) {
    return <>{trigger}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip
        delayDuration={delayDuration}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        <TooltipTrigger
          asChild={asChild}
          className={cn('outline-none', triggerClassName)}
          aria-label={
            typeof tooltipContent === 'string' ? tooltipContent : undefined
          }
        >
          {trigger}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn(
            'z-50 max-w-[250px] overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
            contentClassName
          )}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
        >
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CustomTooltip;
