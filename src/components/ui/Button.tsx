import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark'
type Size = 'sm' | 'md' | 'lg'

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  dark: 'btn-dark',
}

const sizeClass: Record<Size, string> = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
}

type CommonProps = {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  loading?: boolean
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    as?: 'button'
  }

type ButtonAsAnchor = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    as: 'a'
    href: string
  }

type ButtonAsLink = CommonProps &
  Omit<React.ComponentPropsWithoutRef<typeof Link>, keyof CommonProps> & {
    as: 'link'
    href: string
  }

export type ButtonProps = ButtonAsButton | ButtonAsAnchor | ButtonAsLink

export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    fullWidth,
    loading,
    iconLeft,
    iconRight,
    className,
    children,
    ...rest
  } = props as CommonProps & { as?: string; href?: string }

  const classes = cn(
    variantClass[variant],
    sizeClass[size],
    fullWidth && 'btn-full',
    loading && 'opacity-70 pointer-events-none',
    className,
  )

  const content = (
    <>
      {iconLeft ? <span className="mr-2 inline-flex">{iconLeft}</span> : null}
      <span>{children}</span>
      {iconRight ? <span className="ml-2 inline-flex">{iconRight}</span> : null}
    </>
  )

  if ((props as ButtonAsLink).as === 'link') {
    const { as: _as, href, ...linkRest } = rest as ButtonAsLink
    return (
      <Link href={href} className={classes} {...(linkRest as Record<string, unknown>)}>
        {content}
      </Link>
    )
  }

  if ((props as ButtonAsAnchor).as === 'a') {
    const { as: _as, ...anchorRest } = rest as ButtonAsAnchor
    return (
      <a className={classes} {...(anchorRest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </a>
    )
  }

  const { as: _as, ...buttonRest } = rest as ButtonAsButton
  return (
    <button className={classes} disabled={loading || (buttonRest as { disabled?: boolean }).disabled} {...(buttonRest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {content}
    </button>
  )
}
