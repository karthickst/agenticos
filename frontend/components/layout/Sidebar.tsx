'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

interface SidebarProps {
  projectId?: string
}

export function Sidebar({ projectId }: SidebarProps) {
  const pathname = usePathname()

  const navItems = projectId
    ? [
        { href: `/projects/${projectId}`, label: 'Overview' },
        { href: `/projects/${projectId}/requirements`, label: 'Requirements' },
        { href: `/projects/${projectId}/domains`, label: 'Domains' },
        { href: `/projects/${projectId}/data-bags`, label: 'Data Bags' },
        { href: `/projects/${projectId}/test-cases`, label: 'Test Cases' },
        { href: `/projects/${projectId}/specifications`, label: 'Specifications' },
      ]
    : [
        { href: '/projects', label: 'Projects' },
      ]

  return (
    <aside className="w-64 border-r bg-gray-50 min-h-[calc(100vh-4rem)]">
      <nav className="flex flex-col space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-700 hover:bg-gray-200'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
