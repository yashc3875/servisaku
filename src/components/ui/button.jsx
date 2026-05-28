import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium',
    'transition-[transform,background-color,box-shadow,color] duration-150 ease-spring-out',
    'focus-visible:outline-none focus-visible:shadow-ring',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:     'bg-brand text-ink-inverse hover:bg-brand-ink shadow-e1',
        accent:      'bg-accent text-ink-inverse hover:brightness-95 shadow-e1',
        tonal:       'bg-brand-tint text-brand-ink hover:bg-brand-tint/80',
        ghost:       'bg-transparent text-ink hover:bg-raised',
        'ghost-ink': 'bg-transparent text-ink hover:bg-raised',
        outline:     'bg-transparent text-ink hairline hover:bg-raised',
        link:        'bg-transparent text-brand underline-offset-4 hover:underline',
        danger:      'bg-danger text-ink-inverse hover:brightness-95 shadow-e1',

        /* ── shadcn back-compat aliases (existing pages keep working) ── */
        default:     'bg-brand text-ink-inverse hover:bg-brand-ink shadow-e1',
        secondary:   'bg-raised text-ink hover:bg-raised/80',
        destructive: 'bg-danger text-ink-inverse hover:brightness-95 shadow-e1',
      },
      size: {
        sm:      'h-9  px-3.5 text-caption rounded-md  [&_svg]:size-4',
        md:      'h-11 px-4   text-body    rounded-lg  [&_svg]:size-4',
        lg:      'h-12 px-5   text-body    rounded-lg  [&_svg]:size-5',
        xl:      'h-14 px-6   text-lead    rounded-xl  [&_svg]:size-5',
        icon:    'h-11 w-11   rounded-lg              [&_svg]:size-5',
        default: 'h-11 px-4   text-body    rounded-lg  [&_svg]:size-4',
      },
      block: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

const Button = React.forwardRef(
  (
    { className, variant, size, block, asChild = false, loading = false, leftIcon, rightIcon, children, disabled, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, block }), className)}
        disabled={disabled || loading}
        data-loading={loading || undefined}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
