// 실외기케어 대시보드 - 반응형 레이아웃 컴포넌트
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// 컨테이너 래퍼 컴포넌트
interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Container({ 
  children, 
  className = '', 
  size = 'xl',
  padding = 'md'
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl', 
    lg: 'max-w-7xl',
    xl: 'max-w-8xl',
    full: 'max-w-full'
  }

  const paddingClasses = {
    none: '',
    sm: 'px-4 sm:px-6',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12'
  }

  return (
    <div className={cn(
      'mx-auto w-full',
      sizeClasses[size],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}

// 반응형 그리드 컴포넌트
interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  columns?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export function ResponsiveGrid({ 
  children, 
  className = '',
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md'
}: ResponsiveGridProps) {
  const gapClasses = {
    xs: 'gap-2',
    sm: 'gap-3', 
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  }

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2', 
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  }

  const getResponsiveClasses = () => {
    const classes = ['grid']
    
    if (columns.xs) classes.push(gridCols[columns.xs as keyof typeof gridCols])
    if (columns.sm) classes.push(`sm:${gridCols[columns.sm as keyof typeof gridCols]}`)
    if (columns.md) classes.push(`md:${gridCols[columns.md as keyof typeof gridCols]}`)
    if (columns.lg) classes.push(`lg:${gridCols[columns.lg as keyof typeof gridCols]}`)
    if (columns.xl) classes.push(`xl:${gridCols[columns.xl as keyof typeof gridCols]}`)
    
    return classes.join(' ')
  }

  return (
    <div className={cn(
      getResponsiveClasses(),
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  )
}

// 모바일/데스크톱 스택 컴포넌트
interface StackProps {
  children: React.ReactNode
  className?: string
  direction?: 'vertical' | 'horizontal'
  responsiveAt?: 'sm' | 'md' | 'lg' | 'xl'
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
}

export function Stack({ 
  children,
  className = '',
  direction = 'vertical',
  responsiveAt = 'md',
  spacing = 'md',
  align = 'stretch'
}: StackProps) {
  const spacingClasses = {
    xs: 'space-y-2',
    sm: 'space-y-3',
    md: 'space-y-4', 
    lg: 'space-y-6',
    xl: 'space-y-8'
  }

  const horizontalSpacingClasses = {
    xs: 'space-x-2',
    sm: 'space-x-3',
    md: 'space-x-4',
    lg: 'space-x-6', 
    xl: 'space-x-8'
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }

  const baseClasses = 'flex'
  const verticalClasses = `flex-col ${spacingClasses[spacing]} ${alignClasses[align]}`
  const horizontalClasses = `flex-row ${horizontalSpacingClasses[spacing]} ${alignClasses[align]}`

  return (
    <div className={cn(
      baseClasses,
      direction === 'vertical' ? verticalClasses : horizontalClasses,
      responsiveAt === 'sm' && `sm:flex-row sm:${horizontalSpacingClasses[spacing]}`,
      responsiveAt === 'md' && `md:flex-row md:${horizontalSpacingClasses[spacing]}`,
      responsiveAt === 'lg' && `lg:flex-row lg:${horizontalSpacingClasses[spacing]}`,
      responsiveAt === 'xl' && `xl:flex-row xl:${horizontalSpacingClasses[spacing]}`,
      className
    )}>
      {children}
    </div>
  )
}

// 모바일에서 숨기기/보이기 컴포넌트
interface ResponsiveShowProps {
  children: React.ReactNode
  above?: 'sm' | 'md' | 'lg' | 'xl'
  below?: 'sm' | 'md' | 'lg' | 'xl'
  only?: 'mobile' | 'tablet' | 'desktop'
  className?: string
}

export function ResponsiveShow({
  children,
  above,
  below,
  only,
  className = ''
}: ResponsiveShowProps) {
  let visibilityClasses = ''

  if (only === 'mobile') {
    visibilityClasses = 'block sm:hidden'
  } else if (only === 'tablet') {
    visibilityClasses = 'hidden sm:block lg:hidden'
  } else if (only === 'desktop') {
    visibilityClasses = 'hidden lg:block'
  } else {
    if (above) {
      visibilityClasses = `hidden ${above}:block`
    }
    if (below) {
      visibilityClasses += ` ${below}:hidden`
    }
  }

  return (
    <div className={cn(visibilityClasses, className)}>
      {children}
    </div>
  )
}

// 반응형 카드 레이아웃
interface ResponsiveCardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
}

export function ResponsiveCard({ 
  children, 
  className = '',
  padding = 'md',
  hover = false
}: ResponsiveCardProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }

  return (
    <div className={cn(
      'bg-card rounded-lg border shadow-sm',
      paddingClasses[padding],
      hover && 'hover:shadow-md transition-shadow',
      'w-full', // 모바일에서 전체 너비
      className
    )}>
      {children}
    </div>
  )
}

// 반응형 사이드바 레이아웃
interface SidebarLayoutProps {
  children: React.ReactNode
  sidebar: React.ReactNode
  sidebarPosition?: 'left' | 'right'
  sidebarWidth?: 'sm' | 'md' | 'lg'
  className?: string
}

export function SidebarLayout({
  children,
  sidebar,
  sidebarPosition = 'left',
  sidebarWidth = 'md',
  className = ''
}: SidebarLayoutProps) {
  const widthClasses = {
    sm: 'lg:w-64',
    md: 'lg:w-80', 
    lg: 'lg:w-96'
  }

  return (
    <div className={cn('flex flex-col lg:flex-row gap-6', className)}>
      {sidebarPosition === 'left' && (
        <aside className={cn('w-full', widthClasses[sidebarWidth])}>
          {sidebar}
        </aside>
      )}
      
      <main className="flex-1 min-w-0">
        {children}
      </main>

      {sidebarPosition === 'right' && (
        <aside className={cn('w-full lg:order-last', widthClasses[sidebarWidth])}>
          {sidebar}
        </aside>
      )}
    </div>
  )
}

// 반응형 네비게이션 래퍼
interface ResponsiveNavProps {
  children: React.ReactNode
  className?: string
  sticky?: boolean
}

export function ResponsiveNav({
  children,
  className = '',
  sticky = false
}: ResponsiveNavProps) {
  return (
    <nav className={cn(
      'w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      sticky && 'sticky top-0 z-50',
      className
    )}>
      <Container padding="md" className="py-3">
        {children}
      </Container>
    </nav>
  )
}