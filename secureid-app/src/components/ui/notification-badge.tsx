import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const notificationBadgeVariants = cva(
  'absolute flex items-center justify-center rounded-full text-xs font-bold text-white',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 text-[10px]',
        md: 'h-5 w-5 text-xs',
        lg: 'h-6 w-6 text-sm',
      },
      color: {
        red: 'bg-red-500',
        orange: 'bg-orange-500',
        green: 'bg-green-500',
        blue: 'bg-blue-500',
      },
      position: {
        'top-right': '-right-1 -top-1',
        'top-left': '-left-1 -top-1',
        'bottom-right': '-bottom-1 -right-1',
        'bottom-left': '-bottom-1 -left-1',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'red',
      position: 'top-right',
    },
  }
);

export interface NotificationBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof notificationBadgeVariants> {
  count: number;
  max?: number;
  showZero?: boolean;
}

const NotificationBadge = React.forwardRef<HTMLSpanElement, NotificationBadgeProps>(
  ({ className, size, color, position, count, max = 99, showZero = false, ...props }, ref) => {
    if (count === 0 && !showZero) {
      return null;
    }

    const displayCount = count > max ? `${max}+` : count;

    return (
      <span
        ref={ref}
        className={cn(notificationBadgeVariants({ size, color, position }), className)}
        {...props}
      >
        {displayCount}
      </span>
    );
  }
);
NotificationBadge.displayName = 'NotificationBadge';

export { NotificationBadge, notificationBadgeVariants };
