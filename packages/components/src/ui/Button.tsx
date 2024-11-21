import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

import { cn } from '@internalpackage/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:user-select-none',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground hover:bg-primary/90',
                outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                gost_destructive: 'text-destructive hover:bg-destructive/20',
                outline_destructive:
                    'border border-destructive text-destructive bg-background hover:bg-destructive hover:text-destructive-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                'sm-icon': 'h-8 w-8 rounded-md p-2',
                default: 'h-10 px-4 py-2',
                xs: 'h-6 rounded-md px-1',
                sm: 'h-9 rounded-md px-3',
                lg: 'h-11 rounded-md px-8',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
