import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        // Radix UI defaults (keep for compatibility)
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',

        // SecureID custom variants
        primary:
          'bg-brand-orange text-white hover:bg-brand-orange/90 disabled:bg-brand-orange/50 focus-visible:ring-brand-orange/50',
        gradient:
          'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-2xl shadow-orange-500/30 hover:scale-105 hover:shadow-orange-500/50 focus-visible:ring-orange-500/50',
        secondary:
          'bg-slate-700 text-white hover:bg-slate-600 focus-visible:ring-slate-500/50',
        outline:
          'border-2 border-orange-500 bg-transparent text-white backdrop-blur-sm hover:bg-orange-500/10 hover:scale-105 focus-visible:ring-orange-500/50',

        // Action color variants
        success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500/50',
        info: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500/50',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus-visible:ring-yellow-500/50',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/50',
        indigo: 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500/50',

        // Portal variants - Design enfantin
        school:
          'bg-gradient-to-r from-school-sky to-school-sky-dark text-white hover:shadow-lg hover:shadow-school-sky/30 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-school-sky/50 rounded-xl',
        health:
          'bg-gradient-to-r from-health-mint to-health-teal text-white hover:shadow-lg hover:shadow-health-mint/30 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-health-mint/50 rounded-xl',

        // Emotional variants - Pour design parental rassurant
        protective:
          'bg-linear-to-r from-protective to-purple-700 text-white hover:shadow-lg hover:shadow-protective/30 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-protective/50',
        reassuring:
          'bg-linear-to-r from-trust-blue to-trust-blue-dark text-white hover:shadow-lg hover:shadow-trust-blue/30 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-trust-blue/50',
        warm:
          'bg-linear-to-r from-brand-orange to-brand-orange-dark text-white hover:shadow-lg hover:shadow-brand-orange/30 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-brand-orange/50',
      },
      size: {
        default: 'h-10 px-6 py-2',
        sm: 'h-8 px-4 py-2 text-sm',
        md: 'h-10 px-6 py-3 text-base',
        lg: 'h-12 px-8 py-4 text-lg',
        icon: 'size-10',
        'icon-sm': 'size-8',
        'icon-lg': 'size-12',
      },
      rounded: {
        default: 'rounded-lg',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'default',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, rounded, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
